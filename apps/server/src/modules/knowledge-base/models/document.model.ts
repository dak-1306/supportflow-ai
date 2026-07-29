import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { transformToJSON } from "../../../shared/utils/mongoose-preset"; // Import preset dùng chung

export interface IDocument extends MongooseDocument {
  workspaceId: Types.ObjectId;
  name: string;
  type: "PDF" | "DOCX";
  size: number;
  status: "PROCESSING" | "READY" | "FAILED";
  chunkCount: number;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Workspace",
    },
    name: { type: String, required: true },
    type: { type: String, required: true, enum: ["PDF", "DOCX"] },
    size: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ["PROCESSING", "READY", "FAILED"],
      default: "PROCESSING",
    },
    chunkCount: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: transformToJSON, // Tự động loại bỏ __v và đổi _id sang id khi chuyển sang JSON
  },
);

export const DocumentModel = model<IDocument>("Document", documentSchema);
