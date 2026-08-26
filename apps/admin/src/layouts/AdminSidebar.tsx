import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import logo from "@supportflow/assets/imgs/logo.svg";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Separator } from "@supportflow/ui/src/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";
import { NAVIGATION_ITEMS } from "@/shared/config/navigation";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  onOpenLogoutModal: () => void;
}

export function AdminSidebar({
  onCloseMobile,
  onOpenLogoutModal,
}: AdminSidebarProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  // Memoize danh sách nav dựa trên role của user
  const navigation = useMemo(() => {
    if (!user?.role) return [];
    return NAVIGATION_ITEMS.filter((item) =>
      item.allowedRoles.includes(user.role as any),
    );
  }, [user?.role]);

  return (
    <div className="flex h-full flex-col justify-between bg-card text-card-foreground">
      <div className="px-4 py-6">
        <div className="flex items-center gap-2.5 px-2 select-none">
          <img src={logo} alt="SupportFlow AI" className="h-6 w-6 shrink-0" />
          <span className="text-sm font-bold tracking-tight text-foreground">
            Support<span className="text-primary">Flow</span>
          </span>
        </div>

        <Separator className="my-6 bg-border" />

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Button
          type="button"
          variant="destructive"
          className="w-full gap-2"
          onClick={onOpenLogoutModal}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );
}
