import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IWorkspace, UpdateWorkspaceDto } from "@supportflow/shared-types";
import { workspaceApi } from "@/features/workspace/services/workspace.api";

// Key duy nhất cho React Query Cache
export const WORKSPACE_QUERY_KEY = ["workspace", "current"];

export const useWorkspace = () => {
  const queryClient = useQueryClient();

  // 1. Fetch dữ liệu Workspace
  const workspaceQuery = useQuery<IWorkspace, Error>({
    queryKey: WORKSPACE_QUERY_KEY,
    queryFn: workspaceApi.getCurrentWorkspace,
    staleTime: 1000 * 60 * 5, // Cache dữ liệu trong 5 phút
  });

  // 2. Mutation Cập nhật Workspace
  const updateWorkspaceMutation = useMutation<
    IWorkspace,
    Error,
    UpdateWorkspaceDto
  >({
    mutationFn: (payload: UpdateWorkspaceDto) =>
      workspaceApi.updateCurrentWorkspace(payload),
    onSuccess: (updatedData) => {
      // Cập nhật lại cache dữ liệu ngay lập tức mà không cần gọi lại API GET
      queryClient.setQueryData(WORKSPACE_QUERY_KEY, updatedData);
    },
  });

  return {
    workspace: workspaceQuery.data ?? null,
    loading: workspaceQuery.isLoading,
    saving: updateWorkspaceMutation.isPending, // Nếu dùng React Query v4 thì là updateWorkspaceMutation.isLoading
    error:
      workspaceQuery.error?.message ||
      updateWorkspaceMutation.error?.message ||
      null,
    refetch: workspaceQuery.refetch,
    updateWorkspace: updateWorkspaceMutation.mutateAsync,
  };
};
