// Nên ưu tiên dùng Enum hoặc Type Union
export type ConversationStatus = "AI" | "WAITING_ADMIN" | "HUMAN" | "RESOLVED";

// Mẹo: Bạn có thể export thêm Array Constant để Mongoose dùng cho Enum validation
export const CONVERSATION_STATUSES: ConversationStatus[] = [
  "AI",
  "WAITING_ADMIN",
  "HUMAN",
  "RESOLVED",
];
