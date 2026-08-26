// features/workspace/hooks/useWorkspace.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { IWorkspace, UpdateWorkspaceDto } from "@supportflow/shared-types";
import { workspaceApi } from "@/features/workspace/services/workspace.api";

export const WORKSPACE_QUERY_KEY = ["workspace", "current"];

// 1. Hook chuyên dùng để GET
export const useWorkspaceQuery = () => {
  return useQuery<IWorkspace, Error>({
    queryKey: WORKSPACE_QUERY_KEY,
    queryFn: workspaceApi.getCurrentWorkspace,
    staleTime: 1000 * 60 * 5,
  });
};

// 2. Hook chuyên dùng để UPDATE
export const useUpdateWorkspaceMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<IWorkspace, Error, UpdateWorkspaceDto>({
    mutationFn: workspaceApi.updateCurrentWorkspace,
    onSuccess: (updatedData) => {
      // Optimistic/Direct Cache Update
      queryClient.setQueryData(WORKSPACE_QUERY_KEY, updatedData);
    },
    // Lưu ý: Các logic toast.success hoặc toast.error
    // bạn có thể đặt ở đây, hoặc đặt bên ngoài Component sử dụng hook này
  });
};
