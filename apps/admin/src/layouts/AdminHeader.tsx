import { useLocation, useNavigate } from "react-router-dom";
import { Menu, User } from "lucide-react";
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
import { NotificationBell } from "@/features/chat/components/notifications/NotificationBell";
import { AdminSidebar } from "./AdminSidebar";
import { ServerStatusBadge } from "./ServerStatusBadge";
import { ROLE_LABELS } from "@/shared/config/navigation";

interface AdminHeaderProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenLogoutModal: () => void;
}

export function AdminHeader({
  isMobileOpen,
  setIsMobileOpen,
  onOpenLogoutModal,
}: AdminHeaderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // Tách đoạn path cuối cùng làm Breadcrumb Title
  const currentPathName = location.pathname.split("/").filter(Boolean).pop();
  const pageTitle = currentPathName
    ? currentPathName.replace("-", " ")
    : "Dashboard";

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/85 backdrop-blur px-6">
      <div className="flex items-center md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger>
            <div className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 w-9 text-muted-foreground hover:bg-accent">
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

      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-muted-foreground">Hệ thống</span>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground capitalize">{pageTitle}</span>
      </div>

      <div className="flex items-center gap-3.5">
        <ServerStatusBadge />
        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary border border-border hover:bg-secondary/80 transition-colors cursor-pointer">
              <User className="h-4 w-4" />
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
                {ROLE_LABELS[user?.role || ""] || "Thành viên"}
              </span>
            </div>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="cursor-pointer"
            >
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onOpenLogoutModal}
              className="text-destructive cursor-pointer"
            >
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
