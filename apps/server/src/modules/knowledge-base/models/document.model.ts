import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import {
  IDocument as SharedIDocument,
  DocumentType,
  DOCUMENT_STATUS,
} from "@supportflow/shared-types";
import { transformToJSON } from "../../../shared/utils/mongoose-preset";

export interface IDocumentModel
  extends
    Omit<
      SharedIDocument,
      "id" | "workspaceId" | "uploadedBy" | "createdAt" | "updatedAt"
    >,
    MongooseDocument {
  workspaceId: Types.ObjectId;
  uploadedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocumentModel>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Workspace",
    },
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ["PDF", "DOCX"] as DocumentType[],
    },
    size: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.PROCESSING,
    },
    chunkCount: { type: Number, default: 0 },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON: transformToJSON,
  },
);

// ✅ Tối ưu truy vấn danh sách document theo workspace + sort createdAt
documentSchema.index({ workspaceId: 1, createdAt: -1 });

export const DocumentModel = model<IDocumentModel>("Document", documentSchema);
