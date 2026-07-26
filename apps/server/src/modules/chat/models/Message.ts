import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { transformToJSON } from "../../../utils/mongoose-preset";
import {
  MessageSender,
  MessageType,
  MESSAGE_SENDERS,
  MESSAGE_TYPES,
} from "@supportflow/shared-types";
export interface IMessage extends MongooseDocument {
  conversationId: Types.ObjectId;
  sender: MessageSender;
  message: string;
  type: MessageType;
  sources?: Array<any>;
  confidence?: number;
  createdAt: Date;
  metadata?: Record<string, any>;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: String, enum: MESSAGE_SENDERS, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: MESSAGE_TYPES,
      default: "TEXT",
      required: true,
    },
    sources: { type: Schema.Types.Mixed, default: undefined },
    confidence: { type: Number, default: undefined },

    metadata: { type: Schema.Types.Mixed, default: undefined },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: transformToJSON,
  },
);

// Index phục vụ tải lịch sử chat nhanh theo thứ tự thời gian
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = model<IMessage>("Message", MessageSchema);
