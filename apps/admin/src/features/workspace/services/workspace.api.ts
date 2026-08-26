// features/workspace/services/workspace.api.ts
import { api } from "@/shared/services/client";
import { IWorkspace, UpdateWorkspaceDto } from "@supportflow/shared-types";

export const workspaceApi = {
  getCurrentWorkspace: async (): Promise<IWorkspace> => {
    // Không cần try/catch ở đây. Nếu có lỗi, Axios sẽ tự ném (throw).
    // Phía React Query hoặc Interceptor sẽ đón cái lỗi này.
    const response = await api.get<{ data: IWorkspace }>("/workspaces/current");
    return response.data.data;
  },

  updateCurrentWorkspace: async (
    payload: UpdateWorkspaceDto,
  ): Promise<IWorkspace> => {
    const response = await api.patch<{ data: IWorkspace }>(
      "/workspaces/current",
      payload,
    );
    return response.data.data;
  },
};
