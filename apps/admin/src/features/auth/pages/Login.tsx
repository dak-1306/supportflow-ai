import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useLoginMutation } from "@/features/auth/hooks/use-auth.ts";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { loginSchema, LoginFormValues } from "@supportflow/shared-types";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordField } from "@/shared/components/PasswordField";
import { FormAlert } from "@/shared/components/form-alert";
import { getErrorMessage } from "@/shared/utils/error.ts";

const LOGIN_TEXT = {
  title: "Đăng nhập tài khoản",
  description: "Nhập thông tin xác thực để truy cập vào Bảng quản trị",
  emailLabel: "Địa chỉ Email",
  emailPlaceholder: "admin@supportflow.com",
  passwordLabel: "Mật khẩu",
  passwordPlaceholder: "••••••••",
  submitButton: "Đăng nhập",
  submitButtonLoading: "Đang xác thực...",
  registerText: "Chưa có tài khoản? Đăng ký dùng thử",
};

export default function Login() {
  const loginMutation = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <AuthLayout>
      <div className="text-center lg:text-left space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {LOGIN_TEXT.title}
        </h2>
        <p className="text-sm text-slate-500">{LOGIN_TEXT.description}</p>
      </div>

      {loginMutation.isError && (
        <FormAlert
          type="error"
          message={
            loginMutation.isError
              ? getErrorMessage(loginMutation.error, "Đăng nhập thất bại!")
              : null
          }
        />
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            {LOGIN_TEXT.emailLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder={LOGIN_TEXT.emailPlaceholder}
              {...register("email")}
              className={`w-full pl-9 pr-3 py-2.5 bg-white border text-xs rounded-xl outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-500 font-medium">
              {errors.email.message}
            </p>
          )}
        </div>

        <PasswordField
          label={LOGIN_TEXT.passwordLabel}
          placeholder={LOGIN_TEXT.passwordPlaceholder}
          {...register("password")}
          error={errors.password}
        />

        <Button
          type="submit"
          variant="default"
          disabled={loginMutation.isPending}
          size="lg"
          className="w-full flex items-center justify-center gap-2"
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{LOGIN_TEXT.submitButtonLoading}</span>
            </>
          ) : (
            <span>{LOGIN_TEXT.submitButton}</span>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 pt-2">
        <Link
          to="/register"
          className="font-semibold text-blue-600 hover:underline"
        >
          {LOGIN_TEXT.registerText}
        </Link>
      </div>
    </AuthLayout>
  );
}
