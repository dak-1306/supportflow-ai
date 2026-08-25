import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/features/dashboard/services/dashboard.api";
import { DashboardAnalyticsResponse } from "@/features/dashboard/types/types";
import { useAuthStore } from "@/stores/auth.store";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  analytics: (workspaceId: string) =>
    [...dashboardKeys.all, "analytics", workspaceId] as const,
};

export const useDashboard = () => {
  const workspaceId = useAuthStore((state) => state.user?.workspaceId) || "";

  const analyticsQuery = useQuery<DashboardAnalyticsResponse, Error>({
    queryKey: dashboardKeys.analytics(workspaceId),
    queryFn: () => dashboardApi.getAnalytics(workspaceId),
    enabled: !!workspaceId,
    refetchInterval: 30000,
  });

  return {
    analytics: analyticsQuery.data,
    isLoading: analyticsQuery.isLoading,
    isError: analyticsQuery.isError,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
  };
};
