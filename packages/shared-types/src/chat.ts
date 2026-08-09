// packages/shared-types/src/chat.ts
export const MESSAGE_SENDER = {
  CUSTOMER: "CUSTOMER",
  AI: "AI",
  ADMIN: "ADMIN",
} as const;
export type MessageSender =
  (typeof MESSAGE_SENDER)[keyof typeof MESSAGE_SENDER];

export const MESSAGE_TYPE = {
  TEXT: "TEXT",
  SYSTEM: "SYSTEM",
} as const;
export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
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
