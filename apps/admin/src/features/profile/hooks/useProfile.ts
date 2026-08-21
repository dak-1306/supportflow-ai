import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import {
  profileApi,
  UpdateProfileDto,
  ChangePasswordDto,
} from "../services/profile.api";

// 1. Hook Cập nhật Profile
export const useUpdateProfileMutation = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: UpdateProfileDto) =>
      profileApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      const accessToken = localStorage.getItem("access_token") || "";
      const refreshToken = localStorage.getItem("refresh_token") || "";
      setAuth(updatedUser, accessToken, refreshToken);
    },
  });
};

// 2. Hook Đổi Mật Khẩu
export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: ChangePasswordDto) =>
      profileApi.changePassword(payload),
  });
};
