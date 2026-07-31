import { api } from "@/shared/services/client";
import { IUser } from "@supportflow/shared-types";

export interface UpdateProfileDto {
  name?: string;
  avatar?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const profileApi = {
  /**
   * Cập nhật thông tin cá nhân (Tên, Avatar)
   */
  updateProfile: async (payload: UpdateProfileDto): Promise<IUser> => {
    try {
      const response = await api.patch("/users/me", payload);
      return response.data.data;
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể cập nhật thông tin cá nhân";
      throw new Error(serverMessage);
    }
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (payload: ChangePasswordDto): Promise<void> => {
    try {
      await api.patch("/users/me/change-password", payload);
    } catch (error: any) {
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể đổi mật khẩu";
      throw new Error(serverMessage);
    }
  },
};
