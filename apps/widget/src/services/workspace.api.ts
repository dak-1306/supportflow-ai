import { apiClient } from "@/services/api";
import { getWorkspaceId } from "@/utils/config";
import { IWorkspace } from "@supportflow/shared-types";

export const workspaceApi = {
  getWidgetConfig: async (): Promise<IWorkspace> => {
    const workspaceId = getWorkspaceId();

    if (!workspaceId) {
      throw new Error("Missing Workspace ID");
    }

    const response = await apiClient.get(
      `/workspaces/${workspaceId}/public-widget`,
    );

    return response.data.data; // Trả về { primaryColor, title, welcomeMessage, botName... }
  },
};
