export type MessageSender = "CUSTOMER" | "AI" | "ADMIN";
export type MessageType = "TEXT" | "SYSTEM";

export const MESSAGE_SENDERS: MessageSender[] = ["CUSTOMER", "AI", "ADMIN"];
export const MESSAGE_TYPES: MessageType[] = ["TEXT", "SYSTEM"];
export interface IMessage {
  id: string;
  conversationId: string;
  sender: MessageSender;
  message: string;
  type: MessageType;
  sources?: Array<any>;
  confidence?: number;
  metadata?: Record<string, any>;
  createdAt: string | Date;
}
