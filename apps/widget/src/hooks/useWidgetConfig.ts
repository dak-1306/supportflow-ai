import { useQuery } from "@tanstack/react-query";
import { workspaceApi } from "@/services/workspace.api";
import { getWorkspaceId } from "@/utils/config";

export const useWidgetConfig = () => {
  const workspaceId = getWorkspaceId();
  return useQuery({
    queryKey: ["widget-config", workspaceId],
    queryFn: workspaceApi.getWidgetConfig,
    staleTime: 1000 * 60 * 15, // Cache cấu hình 15 phút, không cần refetch nhiều
  });
};
