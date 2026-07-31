import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Building,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom"; // Giả sử dùng React Router
import { Button } from "@supportflow/ui/src/components/ui/button";
import { registerSchema, RegisterFormValues } from "@supportflow/shared-types";
import { useRegisterMutation } from "@/features/auth/hooks/use-auth";
import { AuthLayout } from "@/features/auth/components/AuthLayout";

export default function Register() {
  const registerMutation = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

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

  const serverError = registerMutation.error as any;

  return (
    <AuthLayout>
      {/* Title */}
      <div className="text-center lg:text-left space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Đăng ký tài khoản
        </h2>
        <p className="text-sm text-slate-500">
          Tạo tài khoản mới để bắt đầu trải nghiệm SupportFlow
        </p>
      </div>

      {/* Banner Báo lỗi Server */}
      {registerMutation.isError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-xs animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            {serverError?.response?.data?.message ||
              serverError?.message ||
              "Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!"}
          </span>
        </div>
      )}

      {/* Form Đăng ký */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Họ và tên */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Họ và tên
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Nguyen Van A"
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
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              placeholder="name@company.com"
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
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Mật khẩu
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register("password")}
              className={`w-full pl-9 pr-10 py-2.5 bg-white border text-xs rounded-xl outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-200"
                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-[11px] text-red-500 font-medium">
              {errors.password.message}
            </p>
          )}
        </div>

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
              <span>Đang khởi tạo tài khoản...</span>
            </>
          ) : (
            <span>Tạo tài khoản</span>
          )}
        </Button>
      </form>

      {/* Link chuyển sang trang Login */}
      <div className="text-center text-xs text-slate-500 pt-2">
        Đã có tài khoản?{" "}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </AuthLayout>
  );
}
