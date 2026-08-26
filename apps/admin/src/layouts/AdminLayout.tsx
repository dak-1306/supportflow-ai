import { useState, Suspense } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import { useAdminChatSocket } from "@/features/chat/hooks/useAdminChatSocket";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { PageSpinner } from "@/shared/components/PageSpinner";

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openConfirmLogout, setOpenConfirmLogout] = useState(false);

  useAdminChatSocket();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-dvh w-screen overflow-hidden bg-background">
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-border bg-card">
        <AdminSidebar onOpenLogoutModal={() => setOpenConfirmLogout(true)} />
      </aside>

      <div className="flex flex-1 flex-col md:pl-64 h-full min-h-0 overflow-hidden">
        <AdminHeader
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onOpenLogoutModal={() => setOpenConfirmLogout(true)}
        />
        <main className="flex-1 p-6 lg:p-8 bg-background h-full min-h-0 overflow-auto">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <Suspense fallback={<PageSpinner />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>

      <ConfirmModal
        isOpen={openConfirmLogout}
        onClose={() => setOpenConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Xác nhận đăng xuất"
        description="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        variant="danger"
      />
    </div>
  );
}
