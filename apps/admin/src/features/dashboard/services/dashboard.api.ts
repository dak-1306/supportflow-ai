import { api } from "@/shared/services/client";
import { DashboardAnalyticsResponse } from "@/features/dashboard/types/types";

export const dashboardApi = {
  getAnalytics: async (
    workspaceId: string,
  ): Promise<DashboardAnalyticsResponse> => {
    const response = await api.get(`/workspaces/${workspaceId}/analytics`);
    return response.data.data;
  },
};
