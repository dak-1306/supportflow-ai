import React from "react";
import { Headset, ShieldCheck, Zap } from "lucide-react";
import logo from "@supportflow/assets/imgs/logo.svg";

interface AuthLayoutProps {
  children: React.ReactNode;
}

// 🟢 Constants chứa toàn bộ UI Strings & Config dữ liệu tĩnh
const AUTH_LAYOUT_TEXTS = {
  brandName: "SupportFlow",
  heroTitle: "Quản lý hỗ trợ khách hàng tập trung & thông minh.",
  heroDescription:
    "Giải pháp toàn diện giúp tối ưu hóa luồng xử lý ticket, tăng hiệu suất làm việc cho đội ngũ Agent và đem lại trải nghiệm tuyệt vời cho khách hàng.",
  features: [
    {
      icon: ShieldCheck,
      iconColor: "text-blue-400",
      text: "Bảo mật dữ liệu nhiều lớp theo tiêu chuẩn Enterprise",
    },
    {
      icon: Zap,
      iconColor: "text-amber-400",
      text: "Tự động phân loại ticket bằng AI thông minh",
    },
  ],
  copyright: (year: number) =>
    `© ${year} SupportFlow Inc. All rights reserved.`,
} as const;

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800">
      {/* 🟢 BÊN TRÁI: Branding & Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Decorative Blur Gradients */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <img
              src={logo}
              alt={`${AUTH_LAYOUT_TEXTS.brandName} Logo`}
              className="w-6 h-6"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            {AUTH_LAYOUT_TEXTS.brandName}
          </span>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-8 z-10 my-auto max-w-lg">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              {AUTH_LAYOUT_TEXTS.heroTitle}
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              {AUTH_LAYOUT_TEXTS.heroDescription}
            </p>
          </div>

          {/* Dùng map() thay vì lặp lại JSX cho từng Feature */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            {AUTH_LAYOUT_TEXTS.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 text-slate-300 text-sm"
                >
                  <Icon className={`w-5 h-5 ${feature.iconColor} shrink-0`} />
                  <span>{feature.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 z-10">
          {AUTH_LAYOUT_TEXTS.copyright(currentYear)}
        </div>
      </div>

      {/* 🔵 BÊN PHẢI: Form động */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header Mobile Logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Headset className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold">
              {AUTH_LAYOUT_TEXTS.brandName}
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};
