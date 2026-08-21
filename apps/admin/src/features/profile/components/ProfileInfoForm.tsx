import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { User } from "lucide-react";
import { useUpdateProfileMutation } from "@/features/profile/hooks/useProfile";
import { FormAlert } from "@/shared/components/form-alert";
import { AvatarUpload } from "@/shared/components/AvatarUpload";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import { getErrorMessage } from "@/shared/utils/error";

interface ProfileFormValues {
  name: string;
  avatar: string;
}

const PROFILE_INFO_TEXTS = {
  title: "Thông tin cá nhân",
  emailLabel: "Email (Cố định)",
  nameLabel: "Họ và Tên",
  avatarLabel: "Ảnh đại diện",
  submitButton: "Lưu thay đổi",
  submitButtonLoading: "Đang lưu...",
  successMessage: "Cập nhật thông tin thành công!",
  errorMessage: "Cập nhật thất bại!",
} as const;

export const ProfileInfoForm: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const updateProfileMutation = useUpdateProfileMutation();
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, reset, control } = useForm<ProfileFormValues>(
    {
      defaultValues: {
        name: user?.name || "",
        avatar: user?.avatar || "",
      },
    },
  );

  // Đồng bộ lại dữ liệu khi API profile load xong
  useEffect(() => {
    if (user) {
      reset({ name: user.name || "", avatar: user.avatar || "" });
    }
  }, [user, reset]);

  const onSubmit = (values: ProfileFormValues) => {
    setSuccess(false);
    updateProfileMutation.mutate(values, {
      onSuccess: () => setSuccess(true),
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <User className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-slate-800">
          {PROFILE_INFO_TEXTS.title}
        </h2>
      </div>

      {success && (
        <FormAlert type="success" message={PROFILE_INFO_TEXTS.successMessage} />
      )}
      {updateProfileMutation.isError && (
        <FormAlert
          type="error"
          message={getErrorMessage(
            updateProfileMutation.error,
            PROFILE_INFO_TEXTS.errorMessage,
          )}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {PROFILE_INFO_TEXTS.emailLabel}
          </label>
          <input
            type="email"
            disabled
            value={user?.email || ""}
            className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs text-slate-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            {PROFILE_INFO_TEXTS.nameLabel}
          </label>
          <input
            type="text"
            {...register("name", { required: true })}
            className="w-full border rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Render AvatarUpload thông qua Controller của React Hook Form */}
        <Controller
          name="avatar"
          control={control}
          render={({ field }) => (
            <AvatarUpload value={field.value} onChange={field.onChange} />
          )}
        />

        <Button disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending
            ? PROFILE_INFO_TEXTS.submitButtonLoading
            : PROFILE_INFO_TEXTS.submitButton}
        </Button>
      </form>
    </div>
  );
};
