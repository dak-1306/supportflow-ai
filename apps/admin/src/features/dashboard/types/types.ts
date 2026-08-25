import { ConversationStatus } from "@supportflow/shared-types";

export interface AnalyticsCardsData {
  todayChats: number;
  waitingChats: number;
  totalDocuments: number;
  readyDocuments: number;
  successRate: number;
}

export interface ChartVolumePoint {
  date: string;
  chats: number;
}

export interface RecentConversationItem {
  id: string;
  customerId: string;
  status: ConversationStatus;
  updatedAt: string;
  assignedAdminId?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
}

export interface DashboardAnalyticsResponse {
  cards: AnalyticsCardsData;
  chart: ChartVolumePoint[];
  recentConversations: RecentConversationItem[];
}