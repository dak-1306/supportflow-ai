import { Schema, model, Document as MongooseDocument } from "mongoose";
import { transformToJSON } from "../../../utils/mongoose-preset";
import {
  ConversationStatus,
  CONVERSATION_STATUSES,
} from "@supportflow/shared-types";

export interface IConversation extends MongooseDocument {
  workspaceId: Schema.Types.ObjectId;
  customerId: string;
  status: ConversationStatus;
  assignedAdminId?: Schema.Types.ObjectId | null;
  startedAt: Date;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
}

const ConversationSchema = new Schema<IConversation>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    customerId: { type: String, required: true },
    status: {
      type: String,
      enum: CONVERSATION_STATUSES,
      default: "AI",
      required: true,
    },
    assignedAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    startedAt: { type: Date, default: Date.now, required: true },
    endedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: transformToJSON,
  },
);

// Index theo tài liệu Database Design Spec
ConversationSchema.index({ workspaceId: 1, status: 1, updatedAt: -1 });

export const ConversationModel = model<IConversation>(
  "Conversation",
  ConversationSchema,
);
