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
    const response = await api.patch("/users/me", payload);
    return response.data.data;
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (payload: ChangePasswordDto): Promise<void> => {
    await api.patch("/users/me/change-password", payload);
  },
};