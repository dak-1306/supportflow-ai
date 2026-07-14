import { Schema, model, Document as MongooseDocument } from "mongoose";

export interface IConversation extends MongooseDocument {
  workspaceId: Schema.Types.ObjectId;
  customerId: string;
  status: "AI" | "WAITING_ADMIN" | "HUMAN" | "RESOLVED";
  assignedAdminId?: Schema.Types.ObjectId | null;
  startedAt: Date;
  endedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
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
      enum: ["AI", "WAITING_ADMIN", "HUMAN", "RESOLVED"],
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
  },
);

// Index theo tài liệu Database Design Spec
ConversationSchema.index({ workspaceId: 1, status: 1, updatedAt: -1 });

export const ConversationModel = model<IConversation>(
  "Conversation",
  ConversationSchema,
);
