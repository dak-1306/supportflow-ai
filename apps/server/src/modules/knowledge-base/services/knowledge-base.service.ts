import { Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import {
  documentRepository,
  CreateChunkInput,
} from "../repositories/document.repository";
import { IDocument } from "../models/document.model";
import { DocumentExtractor } from "../utils/document-extractor";
import {
  getGoogleAI,
  qdrantClient,
  validateAiConfig,
  VECTOR_COLLECTION_NAME,
  VECTOR_SIZE,
} from "../../../config/ai.config";
import { AppError } from "../../../utils/app-error";

export class KnowledgeBaseService {
  private isCollectionInitialized = false;

  private async initQdrantCollection(): Promise<void> {
    if (this.isCollectionInitialized) return;

    try {
      const collections = await qdrantClient.getCollections();
      const exists = collections.collections.some(
        (c) => c.name === VECTOR_COLLECTION_NAME,
      );

      if (!exists) {
        console.log(
          `Creating Qdrant collection "${VECTOR_COLLECTION_NAME}" (${VECTOR_SIZE} dimensions)...`,
        );

        await qdrantClient.createCollection(VECTOR_COLLECTION_NAME, {
          vectors: {
            size: VECTOR_SIZE,
            distance: "Cosine",
          },
        });
      } else {
        const collection = await qdrantClient.getCollection(
          VECTOR_COLLECTION_NAME,
        );

        const currentSize =
          typeof collection.config.params.vectors === "object"
            ? collection.config.params.vectors.size
            : undefined;

        if (currentSize !== VECTOR_SIZE) {
          throw new AppError(
            `Qdrant collection "${VECTOR_COLLECTION_NAME}" có vector dimension ${currentSize}, nhưng project yêu cầu ${VECTOR_SIZE}. Hãy xóa collection và tạo lại.`,
            500,
          );
        }
      }

      this.isCollectionInitialized = true;
    } catch (error: any) {
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

    this.processDocumentBackground(document._id.toString(), file.buffer).catch(
      async (err) => {
        console.error(`Lỗi xử lý tài liệu chạy ngầm ${document._id}:`, err);
        await documentRepository.updateDocument(document._id.toString(), {
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
    // 1. Kiểm tra tài liệu, nếu tài liệu đang được xử lý bởi luồng khác thì thoát ngay
    const document = await documentRepository.findDocumentById(documentId);
    if (
      !document ||
      document.status === "READY" ||
      document.status === "FAILED"
    )
      return;

    try {
      validateAiConfig();
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

      // Thực thi tạo dữ liệu nhúng Embedding song song
      const embeddingPromises = rawChunks.map(async (content, index) => {
        const embeddingResponse = await clientAI.models.embedContent({
          model: "gemini-embedding-2",
          contents: content,
        });

        // Hợp lệ hóa kiểu dữ liệu theo genai.d.ts bằng cách truy cập mảng an toàn
        const vector = embeddingResponse.embeddings?.[0]?.values;

        if (!vector) {
          throw new AppError(
            `Không thể tạo sinh embedding cho đoạn văn bản số ${index}`,
            500,
          );
        }

        const vectorId = uuidv4();
        // Đảm bảo trả về ĐÚNG biến 'content' của chunk hiện tại trong vòng lặp map
        return { vectorId, content, vector, index };
      });

      const processedChunks = await Promise.all(embeddingPromises);

      const mongoChunks: CreateChunkInput[] = [];
      const qdrantPoints: any[] = [];

      for (const chunk of processedChunks) {
        mongoChunks.push({
          documentId: document._id as Types.ObjectId,
          workspaceId: document.workspaceId,
          chunkIndex: chunk.index,
          content: chunk.content, // Đảm bảo ghi nhận text riêng biệt
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

      // Xóa bỏ tất cả các chunk cũ của documentId này nếu có (Tránh trùng lặp do cơ chế chạy lại)
      await documentRepository.deleteChunksByDocumentId(documentId);

      // Lưu đồng thời vào cả 2 database
      await Promise.all([
        documentRepository.createChunks(mongoChunks),
        qdrantClient.upsert(VECTOR_COLLECTION_NAME, {
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

    await this.initQdrantCollection();

    await Promise.all([
      qdrantClient.delete(VECTOR_COLLECTION_NAME, {
        filter: {
          must: [{ key: "documentId", match: { value: documentId } }],
        },
      }),
      documentRepository.deleteChunksByDocumentId(documentId),
      documentRepository.deleteDocument(documentId),
    ]);
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();
