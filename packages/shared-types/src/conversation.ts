// packages/shared-types/src/conversation.ts
export const CONVERSATION_STATUS = {
  AI: "AI",
  WAITING_ADMIN: "WAITING_ADMIN",
  HUMAN: "HUMAN",
  RESOLVED: "RESOLVED",
} as const;
export type ConversationStatus =
  (typeof CONVERSATION_STATUS)[keyof typeof CONVERSATION_STATUS];
