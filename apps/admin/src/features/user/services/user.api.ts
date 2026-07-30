import { api } from "@/services/client";
import { IUser, CreateUserDto } from "@supportflow/shared-types";

export const userApi = {
  getUsers: async (): Promise<IUser[]> => {
    try {
      const response = await api.get("/users");
      return response.data.data;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không thể lấy danh sách người dùng";
      throw new Error(serverMessage);
    }
  },

  createUser: async (payload: CreateUserDto): Promise<IUser> => {
    try {
      const response = await api.post("/users", payload);
      return response.data.data;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không thể tạo tài khoản người dùng";
      throw new Error(serverMessage);
    }
  },

  toggleStatus: async (userId: string): Promise<IUser> => {
    try {
      const response = await api.patch(`/users/${userId}/toggle-status`);
      return response.data.data;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không thể cập nhật trạng thái người dùng";
      throw new Error(serverMessage);
    }
  },

  deleteUser: async (userId: string): Promise<void> => {
    try {
      await api.delete(`/users/${userId}`);
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không thể xóa người dùng";
      throw new Error(serverMessage);
    }
  },
};
