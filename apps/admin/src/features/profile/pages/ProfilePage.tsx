import React from "react";
import { User } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { RoleBadge } from "@/features/profile/components/ProfileBadge";
import { ProfileInfoForm } from "@/features/profile/components/ProfileInfoForm";
import { ChangePasswordForm } from "@/features/profile/components/ChangePasswordForm";

const PROFILE_PAGE_TEXTS = {
  loadingMessage: "Đang tải thông tin cá nhân...",
  workspaceIdLabel: "Workspace ID",
  lastLoginLabel: "Đăng nhập gần nhất",
} as const;

export const ProfilePage: React.FC = () => {
  // Lấy trực tiếp user từ Zustand store với Selector
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-500">
        {PROFILE_PAGE_TEXTS.loadingMessage}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      {/* Header Profile */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-2xl font-bold text-slate-800">{user.name}</h1>
            <RoleBadge role={user.role} />
          </div>
          <p className="text-sm text-slate-500">{user.email}</p>
          <div className="text-xs text-slate-400 flex flex-wrap gap-4 pt-1">
            <span>
              {PROFILE_PAGE_TEXTS.workspaceIdLabel}:{" "}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono">
                {user.workspaceId}
              </code>
            </span>
            <span>
              {PROFILE_PAGE_TEXTS.lastLoginLabel}:{" "}
              {user.lastLogin
                ? new Date(user.lastLogin).toLocaleString("vi-VN")
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Grid Chứa 2 Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProfileInfoForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
};
