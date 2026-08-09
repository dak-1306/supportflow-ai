import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  documentRepository,
  CreateChunkInput,
} from "../repositories/document.repository";
import { IDocument } from "@supportflow/shared-types";
import { DocumentExtractor } from "../utils/document-extractor";
import {
  getGoogleAI,
  validateAiConfig,
  AI_MODELS,
} from "@/shared/config/ai.config";
import {
  getQdrantClient,
  QDRANT_CONFIG,
  validateQdrantConfig,
} from "@/shared/config/qdrant.config";
import { AppError } from "@/shared/utils/app-error";

export class KnowledgeBaseService {
  private async initQdrantCollection(): Promise<void> {
    try {
      const qdrantClient = getQdrantClient();
      const collections = await qdrantClient.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === QDRANT_CONFIG.COLLECTION_NAME,
      );

      if (!exists) {
        console.log(
          `Tạo mới Qdrant collection "${QDRANT_CONFIG.COLLECTION_NAME}" (${QDRANT_CONFIG.VECTOR_SIZE} dimensions)...`,
        );

        await qdrantClient.createCollection(QDRANT_CONFIG.COLLECTION_NAME, {
          vectors: {
            size: QDRANT_CONFIG.VECTOR_SIZE,
            distance: "Cosine",
          },
        });
      } else {
        const collection = await qdrantClient.getCollection(
          QDRANT_CONFIG.COLLECTION_NAME,
        );

        const currentSize =
          typeof collection.config.params.vectors === "object"
            ? collection.config.params.vectors.size
            : undefined;

        if (currentSize !== QDRANT_CONFIG.VECTOR_SIZE) {
          throw new AppError(
            `Qdrant collection "${QDRANT_CONFIG.COLLECTION_NAME}" có dimension ${currentSize}, nhưng yêu cầu ${QDRANT_CONFIG.VECTOR_SIZE}. Vui lòng xóa collection trên Qdrant và thử lại.`,
            500,
          );
        }
      }

      // Tạo Payload Index cho workspaceId và documentId để tối ưu truy vấn/xóa
      await Promise.allSettled([
        qdrantClient.createPayloadIndex(QDRANT_CONFIG.COLLECTION_NAME, {
          field_name: "workspaceId",
          field_schema: "keyword",
          wait: true,
        }),
        qdrantClient.createPayloadIndex(QDRANT_CONFIG.COLLECTION_NAME, {
          field_name: "documentId",
          field_schema: "keyword",
          wait: true,
        }),
      ]);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Không thể khởi tạo Qdrant: ${error.message}`, 500);
    }
  }

  async handleUpload(
    workspaceId: string,
    file: { originalname: string; buffer: Buffer; size: number },
    userId?: string,
  ): Promise<IDocument> {
    const fileExtension = file.originalname.split(".").pop()?.toUpperCase();
    const type = fileExtension === "DOCX" ? "DOCX" : "PDF";

    const document = await documentRepository.createDocument({
      workspaceId: new Types.ObjectId(workspaceId),
      name: file.originalname,
      type,
      size: file.size,
      status: "PROCESSING",
      uploadedBy: userId ? new Types.ObjectId(userId) : undefined,
    });

    this.processDocumentBackground(document.id.toString(), file.buffer).catch(
      async (err) => {
        console.error(`Lỗi xử lý tài liệu chạy ngầm ${document.id}:`, err);
        await documentRepository.updateDocument(document.id.toString(), {
          status: "FAILED",
        });
      },
    );

    return document;
  }

  private async processDocumentBackground(
    documentId: string,
    fileBuffer: Buffer,
  ): Promise<void> {
    const document = await documentRepository.findDocumentById(documentId);
    if (
      !document ||
      document.status === "READY" ||
      document.status === "FAILED"
    )
      return;

    try {
      validateAiConfig();
      validateQdrantConfig();
      await this.initQdrantCollection();

      const fullText = await DocumentExtractor.extractText(
        fileBuffer,
        document.type,
      );
      const rawChunks = DocumentExtractor.chunkText(fullText);

      if (rawChunks.length === 0) {
        throw new AppError("Không thể bóc tách nội dung văn bản từ file.", 400);
      }

      const clientAI = getGoogleAI();

      const BATCH_SIZE = 5;
      const processedChunks: Array<{
        vectorId: string;
        content: string;
        vector: number[];
        index: number;
      }> = [];

      for (let i = 0; i < rawChunks.length; i += BATCH_SIZE) {
        const chunkBatch = rawChunks.slice(i, i + BATCH_SIZE);
        const batchResults = await Promise.all(
          chunkBatch.map(async (content, batchIndex) => {
            const index = i + batchIndex;
            const embeddingResponse = await clientAI.models.embedContent({
              model: AI_MODELS.EMBEDDING, // Sử dụng model từ AI_MODELS
              contents: content,
            });

            const vector = embeddingResponse.embeddings?.[0]?.values;

            if (!vector) {
              throw new AppError(
                `Không thể tạo sinh embedding cho đoạn văn bản số ${index}`,
                500,
              );
            }

            return { vectorId: uuidv4(), content, vector, index };
          }),
        );
        processedChunks.push(...batchResults);
      }

      const mongoChunks: CreateChunkInput[] = [];
      const qdrantPoints: any[] = [];

      for (const chunk of processedChunks) {
        mongoChunks.push({
          documentId: new Types.ObjectId(document.id),
          workspaceId: new Types.ObjectId(document.workspaceId),
          chunkIndex: chunk.index,
          content: chunk.content,
          vectorId: chunk.vectorId,
          page: 1,
        });

        qdrantPoints.push({
          id: chunk.vectorId,
          vector: chunk.vector,
          payload: {
            documentId: documentId,
            workspaceId: document.workspaceId.toString(),
            content: chunk.content,
          },
        });
      }

      await documentRepository.deleteChunksByDocumentId(documentId);

      const qdrantClient = getQdrantClient();

      await Promise.all([
        documentRepository.createChunks(mongoChunks),
        qdrantClient.upsert(QDRANT_CONFIG.COLLECTION_NAME, {
          wait: true,
          points: qdrantPoints,
        }),
      ]);

      await documentRepository.updateDocument(documentId, {
        status: "READY",
        chunkCount: rawChunks.length,
      });
    } catch (error) {
      await documentRepository.updateDocument(documentId, { status: "FAILED" });
      throw error;
    }
  }

  async getDocuments(workspaceId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const { docs, total } = await documentRepository.findDocumentsByWorkspace(
      workspaceId,
      { skip, limit },
    );

    return {
      docs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async deleteDocument(workspaceId: string, documentId: string): Promise<void> {
    const document = await documentRepository.findDocumentById(documentId);
    if (!document || document.workspaceId.toString() !== workspaceId) {
      throw new AppError(
        "Tài liệu không tồn tại hoặc bạn không có quyền xóa",
        404,
      );
    }

    try {
      await this.initQdrantCollection();
      const qdrantClient = getQdrantClient();
      await qdrantClient.delete(QDRANT_CONFIG.COLLECTION_NAME, {
        filter: {
          must: [{ key: "documentId", match: { value: documentId } }],
        },
      });
    } catch (error: any) {
      console.warn(
        `[Qdrant Warning] Không thể xóa vector cho doc ${documentId}:`,
        error?.message || error,
      );
    }

    await Promise.all([
      documentRepository.deleteChunksByDocumentId(documentId),
      documentRepository.deleteDocument(documentId),
    ]);
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
