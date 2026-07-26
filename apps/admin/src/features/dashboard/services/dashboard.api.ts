import { api } from "@/services/client"; // Hoặc đường dẫn tương đối tới file axios của bạn
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
  _id: string;
  customerId: string;
  status: ConversationStatus;
  updatedAt: string;
  assignedAdminId?: {
    _id: string;
    name?: string;
    email?: string;
  } | null;
}

export interface DashboardAnalyticsResponse {
  cards: AnalyticsCardsData;
  chart: ChartVolumePoint[];
  recentConversations: RecentConversationItem[];
}

export const dashboardApi = {
  getAnalytics: async (
    workspaceId: string,
  ): Promise<DashboardAnalyticsResponse> => {
    try {
      const response = await api.get(`/workspaces/${workspaceId}/analytics`);
      return response.data.data;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải dữ liệu thống kê từ máy chủ";
      throw new Error(serverMessage);
    }
  },
};
