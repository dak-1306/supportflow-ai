export type SenderType = "CUSTOMER" | "AI" | "ADMIN";
export type MessageType = "TEXT" | "SYSTEM";

export interface IMessage {
  id: string;
  conversationId: string;
  sender: SenderType;
  message: string;
  type: MessageType;
  createdAt: string;
}
