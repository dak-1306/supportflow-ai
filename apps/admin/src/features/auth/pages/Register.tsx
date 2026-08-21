import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User, Building, Loader2 } from "lucide-react";
import { Link } from "react-router-dom"; // Giả sử dùng React Router
import { Button } from "@supportflow/ui/src/components/ui/button";
import { registerSchema, RegisterFormValues } from "@supportflow/shared-types";
import { useRegisterMutation } from "@/features/auth/hooks/use-auth";
import { AuthLayout } from "@/features/auth/components/AuthLayout";
import { PasswordField } from "@/shared/components/PasswordField";
import { FormAlert } from "@/shared/components/form-alert";
import { getErrorMessage } from "@/shared/utils/error";

const REGISTER_TEXT = {
  title: "Đăng ký tài khoản",
  description: "Tạo tài khoản mới để bắt đầu trải nghiệm SupportFlow",
  fullNameLabel: "Họ và tên",
  fullNamePlaceholder: "Nguyen Van A",
  emailLabel: "Địa chỉ Email",
  emailPlaceholder: "name@company.com",
  workspaceNameLabel: "Tên Workspace",
  workspaceNamePlaceholder: "Tên công ty của bạn",
  passwordLabel: "Mật khẩu",
  passwordPlaceholder: "••••••••",
  submitButton: "Đăng ký",
  submitButtonLoading: "Đang tạo tài khoản...",
  loginLink: "Đã có tài khoản? Đăng nhập ngay",
};

export default function Register() {
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      workspaceName: "",
      password: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <AuthLayout>
      {/* Title */}
      <div className="text-center lg:text-left space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {REGISTER_TEXT.title}
        </h2>
        <p className="text-sm text-slate-500">{REGISTER_TEXT.description}</p>
      </div>

      {/* Banner Báo lỗi Server */}
      {registerMutation.isError && (
        <FormAlert
          type="error"
          message={
            registerMutation.isError
              ? getErrorMessage(registerMutation.error, "Đăng ký thất bại!")
              : null
          }
        />
      )}

      {/* Form Đăng ký */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            {REGISTER_TEXT.fullNameLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder={REGISTER_TEXT.fullNamePlaceholder}
              {...register("fullName")}
              className={`w-full pl-9 pr-3 py-2.5 bg-white border text-xs rounded-xl outline-none focus:ring-2 ${
                errors.fullName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>
          {errors.fullName && (
            <p className="text-[11px] text-red-500 font-medium">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            {REGISTER_TEXT.emailLabel}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder={REGISTER_TEXT.emailPlaceholder}
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

        {/* Tên Tổ chức / Workspace */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Tên Workspace / Công ty
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Building className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Acme Inc."
              {...register("workspaceName")}
              className={`w-full pl-9 pr-3 py-2.5 bg-white border text-xs rounded-xl outline-none focus:ring-2 ${
                errors.workspaceName
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
          </div>
          {errors.workspaceName && (
            <p className="text-[11px] text-red-500 font-medium">
              {errors.workspaceName.message}
            </p>
          )}
        </div>

        {/* Mật khẩu */}
        <PasswordField
          label={REGISTER_TEXT.passwordLabel}
          placeholder={REGISTER_TEXT.passwordPlaceholder}
          {...register("password")}
          error={errors.password}
        />

        {/* Submit button */}
        <Button
          type="submit"
          variant="default"
          disabled={registerMutation.isPending}
          size="lg"
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{REGISTER_TEXT.submitButtonLoading}</span>
            </>
          ) : (
            <span>{REGISTER_TEXT.submitButton}</span>
          )}
        </Button>
      </form>

      {/* Link chuyển sang trang Login */}
      <div className="text-center text-xs text-slate-500 pt-2">
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          {REGISTER_TEXT.loginLink}
        </Link>
      </div>
    </AuthLayout>
  );
}
