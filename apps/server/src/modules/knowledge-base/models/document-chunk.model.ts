import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { transformToJSON } from "../../../shared/utils/mongoose-preset"; // Import preset dùng chung

export interface IDocumentChunk extends MongooseDocument {
  documentId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  chunkIndex: number;
  content: string;
  vectorId: string;
  page: number;
  createdAt: Date;
  updatedAt: Date;
}

const documentChunkSchema = new Schema<IDocumentChunk>(
  {
    documentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Document",
    },
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Workspace",
    },
    chunkIndex: { type: Number, required: true },
    content: { type: String, required: true },
    vectorId: { type: String, required: true },
    page: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    toJSON: transformToJSON, // Tự động loại bỏ __v và đổi _id sang id khi chuyển sang JSON
  },
);

documentChunkSchema.index({ workspaceId: 1, documentId: 1 });

export const DocumentChunkModel = model<IDocumentChunk>(
  "DocumentChunk",
  documentChunkSchema,
);
