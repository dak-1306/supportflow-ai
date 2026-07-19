import { Types } from "mongoose";
import { DocumentModel, IDocument } from "../models/document.model";
import {
  DocumentChunkModel,
  IDocumentChunk,
} from "../models/document-chunk.model";

// Định nghĩa cấu trúc chuẩn cho dữ liệu input khi tạo chunk, bắt buộc phải có các trường core
export type CreateChunkInput = {
  documentId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  chunkIndex: number;
  content: string;
  vectorId: string;
  page?: number;
};

export class DocumentRepository {
  async createDocument(data: Partial<IDocument>): Promise<IDocument> {
    return await DocumentModel.create(data);
  }

  async updateDocument(
    id: string | Types.ObjectId,
    updateData: Partial<IDocument>,
  ): Promise<IDocument | null> {
    return await DocumentModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).exec();
  }

  async findDocumentById(
    id: string | Types.ObjectId,
  ): Promise<IDocument | null> {
    return await DocumentModel.findById(id).exec();
  }

  async findDocumentsByWorkspace(
    workspaceId: string | Types.ObjectId,
    { skip, limit }: { skip: number; limit: number },
  ): Promise<{ docs: IDocument[]; total: number }> {
    const query = { workspaceId: new Types.ObjectId(workspaceId.toString()) };

    const [docs, total] = await Promise.all([
      DocumentModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      DocumentModel.countDocuments(query).exec(),
    ]);

    return { docs, total };
  }

  async deleteDocument(id: string | Types.ObjectId): Promise<IDocument | null> {
    return await DocumentModel.findByIdAndDelete(id).exec();
  }

  // Thay đổi ở đây: Ép kiểu tường minh qua Unknown để xử lý triệt để lỗi kiểu của Mongoose insertMany
  async createChunks(
    chunksData: CreateChunkInput[],
  ): Promise<IDocumentChunk[]> {
    const result = await DocumentChunkModel.insertMany(chunksData);
    return result as unknown as IDocumentChunk[];
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
