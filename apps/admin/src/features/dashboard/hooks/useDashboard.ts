import { useQuery } from "@tanstack/react-query";
import {
  dashboardApi,
  DashboardAnalyticsResponse,
} from "@/features/dashboard/services/dashboard.api";
import { useAuthStore } from "@/stores/auth.store";

export const useDashboard = () => {
  const { user } = useAuthStore();
  const workspaceId = user?.workspaceId || "";

  const analyticsQuery = useQuery<DashboardAnalyticsResponse, Error>({
    queryKey: ["dashboard-analytics", workspaceId],
    queryFn: () => {
      if (!workspaceId) throw new Error("Không tìm thấy thông tin Workspace");
      return dashboardApi.getAnalytics(workspaceId);
    },
    enabled: !!workspaceId,
    refetchInterval: 30000, // Tự động làm mới dữ liệu mỗi 30 giây (Realtime Polling)
  });

  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    isError: analyticsQuery.isError,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  };
};
