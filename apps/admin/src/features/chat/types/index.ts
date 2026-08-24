// Import interface dùng chung từ package shared

import { ConversationStatus } from "@supportflow/shared-types";

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
  lastMessage?: string;
}
