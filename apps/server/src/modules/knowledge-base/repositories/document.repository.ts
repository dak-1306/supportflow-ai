import { Types } from "mongoose";
import { DocumentModel, IDocumentModel } from "../models/document.model";
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

export class DocumentRepository {
  async createDocument(data: Partial<IDocumentModel>): Promise<IDocument> {
    const doc = await DocumentModel.create(data);
    return doc.toJSON() as unknown as IDocument; // Dùng toJSON() để biến đổi _id -> id
  }

  async updateDocument(
    id: string | Types.ObjectId,
    updateData: Partial<IDocumentModel>,
  ): Promise<IDocument | null> {
    const updated = await DocumentModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).exec();

    return updated ? (updated.toJSON() as unknown as IDocument) : null;
  }

  async findDocumentById(
    id: string | Types.ObjectId,
  ): Promise<IDocument | null> {
    const doc = await DocumentModel.findById(id).exec();
    return doc ? (doc.toJSON() as unknown as IDocument) : null;
  }

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

    // Gọi toJSON() để kích hoạt transformToJSON (chuyển _id thành id, xóa __v)
    const docs = rawDocs.map((doc) => doc.toJSON() as unknown as IDocument);

    return { docs, total };
  }

  async deleteDocument(id: string | Types.ObjectId): Promise<IDocument | null> {
    const deleted = await DocumentModel.findByIdAndDelete(id).exec();
    return deleted ? (deleted.toJSON() as unknown as IDocument) : null;
  }

  async createChunks(
    chunksData: CreateChunkInput[],
  ): Promise<IDocumentChunk[]> {
    const result = await DocumentChunkModel.insertMany(chunksData);
    return (result as any[]).map(
      (chunk) => chunk.toJSON() as unknown as IDocumentChunk,
    );
  }

  async deleteChunksByDocumentId(
    documentId: string | Types.ObjectId,
  ): Promise<any> {
    return await DocumentChunkModel.deleteMany({
      documentId: new Types.ObjectId(documentId.toString()),
    }).exec();
  }
}

export const documentRepository = new DocumentRepository();
