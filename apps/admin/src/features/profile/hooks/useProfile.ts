import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import {
  profileApi,
  UpdateProfileDto,
  ChangePasswordDto,
} from "@/features/profile/services/profile.api";

export const useProfile = () => {
  const { user, setAuth } = useAuthStore();

  // Mutation cập nhật thông tin cá nhân
  const updateProfileMutation = useMutation({
    mutationFn: (payload: UpdateProfileDto) =>
      profileApi.updateProfile(payload),
    onSuccess: (updatedUser) => {
      // Cập nhật lại user trong Zustand store (giữ nguyên token)
      const accessToken = localStorage.getItem("access_token") || "";
      const refreshToken = localStorage.getItem("refresh_token") || "";
      setAuth(updatedUser, accessToken, refreshToken);
    },
  });

  // Mutation đổi mật khẩu
  const changePasswordMutation = useMutation({
    mutationFn: (payload: ChangePasswordDto) =>
      profileApi.changePassword(payload),
  });

  return {
    user,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error?.message || null,

    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    passwordError: changePasswordMutation.error?.message || null,
  };
};
