import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { IDocumentChunk as SharedIDocumentChunk } from "@supportflow/shared-types";
import { transformToJSON } from "../../../shared/utils/mongoose-preset";

export interface IDocumentChunkModel
  extends
    Omit<
      SharedIDocumentChunk,
      "id" | "documentId" | "workspaceId" | "createdAt" | "updatedAt"
    >,
    MongooseDocument {
  documentId: Types.ObjectId;
  workspaceId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const documentChunkSchema = new Schema<IDocumentChunkModel>(
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
    toJSON: transformToJSON,
  },
);

documentChunkSchema.index({ workspaceId: 1, documentId: 1 });

export const DocumentChunkModel = model<IDocumentChunkModel>(
  "DocumentChunk",
  documentChunkSchema,
);
