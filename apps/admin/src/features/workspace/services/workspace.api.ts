// features/workspace/services/workspace.api.ts
import { api } from "@/shared/services/client";
import { IWorkspace, UpdateWorkspaceDto } from "@supportflow/shared-types";

export const workspaceApi = {
  getCurrentWorkspace: (): Promise<IWorkspace> => {
    return api.get<IWorkspace>("/workspaces/current");
  },

  updateCurrentWorkspace: (
    payload: UpdateWorkspaceDto,
  ): Promise<IWorkspace> => {
    return api.patch<IWorkspace>("/workspaces/current", payload);
  },
};
