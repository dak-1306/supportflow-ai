import { apiClient } from "@/services/api";
export const workspaceApi = {
  getWidgetConfig: async () => {
    const response = await apiClient.get(
      `/workspaces/${import.meta.env.VITE_WORKSPACE_ID}/public-widget`,
    );
    return response.data.data; // Trả về { primaryColor, title, welcomeMessage, botName... }
  },
};
