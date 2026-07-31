import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { useProfile } from "@/features/profile/hooks/useProfile";
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from "@/features/profile/schemas/change-password.schema";

export const ChangePasswordForm: React.FC = () => {
  const { changePassword, isChangingPassword, passwordError } = useProfile();
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
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      setSuccess(true);
      reset(); // Xóa sạch input sau khi đổi thành công
    } catch {
      // Error đã được xử lý trong hook
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
      <div className="flex items-center gap-2 border-b pb-3">
        <KeyRound className="w-5 h-5 text-blue-600" />
        <h2 className="font-semibold text-slate-800">Đổi mật khẩu</h2>
      </div>

      {success && (
        <div className="p-3 bg-green-50 text-green-700 text-xs rounded-lg border border-green-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Đổi mật khẩu thành công!
        </div>
      )}

      {passwordError && (
        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {passwordError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mật khẩu hiện tại
          </label>
          <input
            type="password"
            {...register("currentPassword")}
            className={`w-full border rounded-lg p-2.5 text-xs outline-none focus:ring-2 ${
              errors.currentPassword
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-500"
            }`}
          />
          {errors.currentPassword && (
            <p className="text-[11px] text-red-500 mt-1">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mật khẩu mới
          </label>
          <input
            type="password"
            {...register("newPassword")}
            className={`w-full border rounded-lg p-2.5 text-xs outline-none focus:ring-2 ${
              errors.newPassword
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-500"
            }`}
          />
          {errors.newPassword && (
            <p className="text-[11px] text-red-500 mt-1">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <input
            type="password"
            {...register("confirmPassword")}
            className={`w-full border rounded-lg p-2.5 text-xs outline-none focus:ring-2 ${
              errors.confirmPassword
                ? "border-red-500 focus:ring-red-200"
                : "focus:ring-blue-500"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-[11px] text-red-500 mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isChangingPassword}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium text-xs transition-colors disabled:opacity-50"
        >
          {isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
        </button>
      </form>
    </div>
  );
};
