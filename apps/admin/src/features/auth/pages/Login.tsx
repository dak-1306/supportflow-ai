import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  Headset,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useLoginMutation } from "@/features/auth/hooks/use-auth.ts";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { loginSchema, LoginFormValues } from "@supportflow/shared-types";
import logo from "@supportflow/assets/imgs/logo.svg";

export default function Login() {
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

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

  const serverError = loginMutation.error as any;

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800">
      {/* 🟢 BÊN TRÁI: Branding & Hero Section (Ẩn trên màn hình nhỏ) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Blur Gradients */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <img src={logo} alt="SupportFlow Logo" className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            SupportFlow
          </span>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-8 z-10 my-auto max-w-lg">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Quản lý hỗ trợ khách hàng tập trung & thông minh.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Giải pháp toàn diện giúp tối ưu hóa luồng xử lý ticket, tăng hiệu
              suất làm việc cho đội ngũ Agent và đem lại trải nghiệm tuyệt vời
              cho khách hàng.
            </p>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Bảo mật dữ liệu nhiều lớp theo tiêu chuẩn Enterprise</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-sm">
              <Zap className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Tự động phân loại ticket bằng AI thông minh</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 z-10">
          © {new Date().getFullYear()} SupportFlow Inc. All rights reserved.
        </div>
      </div>

      {/* 🔵 BÊN PHẢI: Form Đăng nhập */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile / Title */}
          <div className="text-center lg:text-left space-y-2">
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Headset className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold">SupportFlow</span>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Đăng nhập tài khoản
            </h2>
            <p className="text-sm text-slate-500">
              Nhập thông tin xác thực để truy cập vào Bảng quản trị
            </p>
          </div>

          {/* Banner Báo lỗi Server */}
          {loginMutation.isError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {serverError?.response?.data?.message ||
                  serverError?.message ||
                  "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!"}
              </span>
            </div>
          )}

          {/* Form chính */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Trường Email */}
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
                  placeholder="admin@supportflow.com"
                  {...register("email")}
                  className={`w-full pl-9 pr-3 py-2.5 bg-white border text-xs rounded-xl transition-all duration-200 outline-none focus:ring-2 ${
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

            {/* Trường Mật khẩu */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Mật khẩu
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full pl-9 pr-10 py-2.5 bg-white border text-xs rounded-xl transition-all duration-200 outline-none focus:ring-2 ${
                    errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
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

            {/* Nút Đăng nhập */}
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
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
