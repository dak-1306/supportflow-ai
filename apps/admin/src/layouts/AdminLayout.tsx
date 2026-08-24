import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useAdminChatSocket } from "@/features/chat/hooks/useAdminChatSocket";
import { ConfirmModal } from "@/shared/components/ConfirmModal";

import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const ADMIN_LAYOUT_TEXT = {
  confirmLogoutTitle: "Xác nhận đăng xuất",
  confirmLogoutDescription:
    "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?",
  confirmLogoutConfirmText: "Đăng xuất",
  confirmLogoutCancelText: "Hủy",
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openConfirmLogout, setOpenConfirmLogout] = useState(false);

  // Kích hoạt Socket
  useAdminChatSocket();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* SIDEBAR FIXED (Desktop) */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-border bg-card">
        <AdminSidebar onOpenLogoutModal={() => setOpenConfirmLogout(true)} />
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col md:pl-64 h-full min-h-0 overflow-hidden">
        {/* HEADER */}
        <AdminHeader
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenLogoutModal={() => setOpenConfirmLogout(true)}
        />

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-8 bg-background h-full min-h-0 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full min-h-0 flex flex-col">
            {children}
          </div>
        </main>
      </div>

      {/* MODAL XÁC NHẬN ĐĂNG XUẤT */}
      <ConfirmModal
        isOpen={openConfirmLogout}
        onClose={() => setOpenConfirmLogout(false)}
        onConfirm={handleLogout}
        title={ADMIN_LAYOUT_TEXT.confirmLogoutTitle}
        description={ADMIN_LAYOUT_TEXT.confirmLogoutDescription}
        confirmText={ADMIN_LAYOUT_TEXT.confirmLogoutConfirmText}
        cancelText={ADMIN_LAYOUT_TEXT.confirmLogoutCancelText}
        variant="danger"
      />
    </div>
  );
}
