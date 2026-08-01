import { apiClient } from "@/services/api";
import { getWorkspaceId } from "@/utils/config";

export const workspaceApi = {
  getWidgetConfig: async () => {
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
