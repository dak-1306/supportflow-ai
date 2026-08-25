import { Types } from "mongoose";
import { BaseRepository } from "../../../shared/repositories/base.repository";
import { DocumentModel } from "../models/document.model";
import { DocumentChunkModel } from "../models/document-chunk.model";
import { IDocument, IDocumentChunk } from "@supportflow/shared-types";

export type CreateChunkInput = {
  documentId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  chunkIndex: number;
  content: string;
  vectorId: string;
  page?: number;
};

export class DocumentRepository extends BaseRepository<IDocument> {
  constructor() {
    super(DocumentModel);
  }

  // Tận dụng lại CRUD từ BaseRepository:
  // - findById()
  // - create()
  // - update()
  // - delete()

  async findDocumentsByWorkspace(
    workspaceId: string | Types.ObjectId,
    { skip, limit }: { skip: number; limit: number },
  ): Promise<{ docs: IDocument[]; total: number }> {
    const query = { workspaceId: new Types.ObjectId(workspaceId.toString()) };

    const [rawDocs, total] = await Promise.all([
      DocumentModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      DocumentModel.countDocuments(query).exec(),
    ]);

    const docs = rawDocs.map((doc) => doc.toJSON() as unknown as IDocument);
    return { docs, total };
  }

  async createChunks(
    chunksData: CreateChunkInput[],
  ): Promise<IDocumentChunk[]> {
    const result = await DocumentChunkModel.insertMany(chunksData);
    return result.map((chunk) => chunk.toJSON() as unknown as IDocumentChunk);
  }

  async deleteChunksByDocumentId(
    documentId: string | Types.ObjectId,
  ): Promise<void> {
    await DocumentChunkModel.deleteMany({
      documentId: new Types.ObjectId(documentId.toString()),
    }).exec();
  }
}

export const documentRepository = new DocumentRepository();
