import { api } from "@/shared/services/client";
import { IWorkspace, UpdateWorkspaceDto } from "@supportflow/shared-types";

export const workspaceApi = {
  /**
   * Lấy thông tin Workspace của User hiện tại
   */
  getCurrentWorkspace: async (): Promise<IWorkspace> => {
    try {
      const response = await api.get("/workspaces/current");
      return response.data.data;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không thể lấy thông tin workspace";
      throw new Error(serverMessage);
    }
  },

  /**
   * Cập nhật cấu hình Workspace (AI & Widget)
   */
  updateCurrentWorkspace: async (
    payload: UpdateWorkspaceDto,
  ): Promise<IWorkspace> => {
    try {
      const response = await api.patch("/workspaces/current", payload);
      return response.data.data;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không thể cập nhật cấu hình workspace";
      throw new Error(serverMessage);
    }
  },
};
