import { useQuery } from "@tanstack/react-query";
import { workspaceApi } from "@/services/workspace.api";

export const useWidgetConfig = () => {
  return useQuery({
    queryKey: ["widget-config", import.meta.env.VITE_WORKSPACE_ID],
    queryFn: workspaceApi.getWidgetConfig,
    staleTime: 1000 * 60 * 15, // Cache cấu hình 15 phút, không cần refetch nhiều
  });
};
