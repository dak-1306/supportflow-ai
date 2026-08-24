import { useLocation, useNavigate } from "react-router-dom";
import { Menu, Bot } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@supportflow/ui/src/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@supportflow/ui/src/components/ui/dropdown-menu";

import { useAuthStore } from "@/stores/auth.store";
import { NotificationBell } from "@/features/chat/components/NotificationBell";
import { AdminSidebar } from "./AdminSidebar";
import { ServerStatusBadge } from "./ServerStatusBadge";

interface AdminHeaderProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenLogoutModal: () => void;
}

const ADMIN_HEADER_TEXT = {
  profileText: "Hồ sơ cá nhân",
  logoutText: "Đăng xuất",
  systemText: "Hệ thống",
};

export function AdminHeader({
  isMobileOpen,
  setIsMobileOpen,
  onOpenLogoutModal,
}: AdminHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "owner":
        return "Owner (Chủ sở hữu)";
      case "admin":
        return "Quản trị viên";
      case "agent":
        return "Tư vấn viên";
      default:
        return "Thành viên";
    }
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/85 backdrop-blur px-6">
      {/* Mobile Drawer Toggle */}
      <div className="flex items-center md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger>
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-9 w-9 text-muted-foreground">
              <Menu className="h-5 w-5" />
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-border">
            <AdminSidebar
              onCloseMobile={() => setIsMobileOpen(false)}
              onOpenLogoutModal={onOpenLogoutModal}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Breadcrumb / Page Title */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-muted-foreground">
          {ADMIN_HEADER_TEXT.systemText}
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground capitalize">
          {location.pathname.replace("/", "") || "Dashboard"}
        </span>
      </div>

      {/* Actions, Status & Profile */}
      <div className="flex items-center gap-3.5">
        {/* Nút Trạng thái Server (Online/Offline) */}
        <ServerStatusBadge />

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary border border-border hover:bg-secondary/80 transition-colors cursor-pointer">
              <Bot className="h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 bg-card border border-border p-4 shadow-md"
          >
            <div className="flex flex-col gap-1 py-1">
              <p className="text-sm font-bold text-foreground">
                {user?.name || "Thành viên"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
              <span className="mt-1 inline-block w-fit rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {getRoleLabel(user?.role)}
              </span>
            </div>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
            >
              {ADMIN_HEADER_TEXT.profileText}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onOpenLogoutModal}
              className="text-destructive focus:bg-destructive/5 cursor-pointer"
            >
              {ADMIN_HEADER_TEXT.logoutText}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
