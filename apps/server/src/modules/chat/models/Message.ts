import { Schema, model, Document as MongooseDocument, Types } from "mongoose";
import { transformToJSON } from "../../../utils/mongoose-preset";

export interface IMessage extends MongooseDocument {
  conversationId: Types.ObjectId;
  sender: "CUSTOMER" | "AI" | "ADMIN";
  message: string;
  type: "TEXT" | "SYSTEM";
  sources?: Array<any>;
  confidence?: number;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: { type: String, enum: ["CUSTOMER", "AI", "ADMIN"], required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["TEXT", "SYSTEM"],
      default: "TEXT",
      required: true,
    },
    sources: { type: [Schema.Types.Mixed], default: undefined },
    confidence: { type: Number, default: undefined },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: transformToJSON,
  },
);

// Index phục vụ tải lịch sử chat nhanh theo thứ tự thời gian
MessageSchema.index({ conversationId: 1, createdAt: 1 });

export const MessageModel = model<IMessage>("Message", MessageSchema);
