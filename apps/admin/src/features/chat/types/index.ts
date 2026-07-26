// Import interface dùng chung từ package shared
import { IMessage, ConversationStatus } from "@supportflow/shared-types";

export interface IConversation {
  id: string;
  workspaceId: string;
  customerId: string;
  status: ConversationStatus;
  assignedAdminId: string | null;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string; // Tiện cho việc hiển thị Sidebar
}

// Định nghĩa luôn State của Admin Chat Store tại đây
export interface AdminChatState {
  activeConversationId: string | null;
  isCustomerTyping: boolean;
  isAITyping: boolean;
  realtimeMessages: Record<string, IMessage[]>;
}
