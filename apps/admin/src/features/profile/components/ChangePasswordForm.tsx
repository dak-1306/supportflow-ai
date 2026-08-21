import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useChangePasswordMutation } from "@/features/profile/hooks/useProfile";
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from "@/features/profile/schemas/change-password.schema";
import { FormAlert } from "@/shared/components/form-alert";
import { PasswordField } from "@/shared/components/PasswordField";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { getErrorMessage } from "@/shared/utils/error";

const CHANGE_PASSWORD_TEXTS = {
  title: "Đổi mật khẩu",
  currentPasswordLabel: "Mật khẩu hiện tại",
  currentPasswordPlaceholder: "Nhập mật khẩu hiện tại",
  newPasswordLabel: "Mật khẩu mới",
  newPasswordPlaceholder: "Nhập mật khẩu mới",
  confirmPasswordLabel: "Xác nhận mật khẩu mới",
  confirmPasswordPlaceholder: "Nhập lại mật khẩu mới",
  submitButton: "Cập nhật mật khẩu",
  submitButtonLoading: "Đang xử lý...",
  successMessage: "Đổi mật khẩu thành công!",
  errorMessage: "Đổi mật khẩu thất bại!",
} as const;

export const ChangePasswordForm: React.FC = () => {
  const changePasswordMutation = useChangePasswordMutation();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setSuccess(false);
    changePasswordMutation.mutate(values, {
      onSuccess: () => {
        setSuccess(true);
        reset();
      },
    });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <KeyRound className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-slate-800">
          {CHANGE_PASSWORD_TEXTS.title}
        </h2>
      </div>

      {/* Rút gọn chuỗi hiển thị alert */}
      {success && (
        <FormAlert
          type="success"
          message={CHANGE_PASSWORD_TEXTS.successMessage}
        />
      )}
      {changePasswordMutation.isError && (
        <FormAlert
          type="error"
          message={getErrorMessage(
            changePasswordMutation.error,
            CHANGE_PASSWORD_TEXTS.errorMessage,
          )}
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <PasswordField
          label={CHANGE_PASSWORD_TEXTS.currentPasswordLabel}
          placeholder={CHANGE_PASSWORD_TEXTS.currentPasswordPlaceholder}
          {...register("currentPassword")}
          error={errors.currentPassword}
        />

        <PasswordField
          label={CHANGE_PASSWORD_TEXTS.newPasswordLabel}
          placeholder={CHANGE_PASSWORD_TEXTS.newPasswordPlaceholder}
          {...register("newPassword")}
          error={errors.newPassword}
        />

        <PasswordField
          label={CHANGE_PASSWORD_TEXTS.confirmPasswordLabel}
          placeholder={CHANGE_PASSWORD_TEXTS.confirmPasswordPlaceholder}
          {...register("confirmPassword")}
          error={errors.confirmPassword}
        />

        <Button disabled={changePasswordMutation.isPending}>
          {changePasswordMutation.isPending
            ? CHANGE_PASSWORD_TEXTS.submitButtonLoading
            : CHANGE_PASSWORD_TEXTS.submitButton}
        </Button>
      </form>
    </div>
  );
};
