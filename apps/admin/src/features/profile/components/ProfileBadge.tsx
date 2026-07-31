import React from "react";
import { UserRole } from "@supportflow/shared-types";

interface Props {
  role?: UserRole | string;
}

export const RoleBadge: React.FC<Props> = ({ role }) => {
  const roleConfigs: Record<string, { label: string; className: string }> = {
    owner: {
      label: "Chủ sở hữu (Owner)",
      className: "bg-purple-100 text-purple-700 border-purple-200",
    },
    admin: {
      label: "Quản trị viên (Admin)",
      className: "bg-blue-100 text-blue-700 border-blue-200",
    },
    agent: {
      label: "Nhân viên hỗ trợ (Agent)",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
  };

  const config = roleConfigs[role || "agent"] || {
    label: role,
    className: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.className}`}
    >
      {config.label}
    </span>
  );
};
