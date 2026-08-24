import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Bot,
  FileText,
  Sparkles,
  Users,
} from "lucide-react";
import logo from "@supportflow/assets/imgs/logo.svg";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Separator } from "@supportflow/ui/src/components/ui/separator";
import { useAuthStore } from "@/stores/auth.store";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  onOpenLogoutModal: () => void;
}

const ADMIN_SIDEBAR_TEXT = {
  dashboardText: "Dashboard",
  chatText: "Hội thoại",
  knowledgeBaseText: "Kiến thức",
  ragTestText: "RAG Test",
  teamText: "Đội ngũ",
  workspaceSettingsText: "Cấu hình Workspace",
  profileText: "Hồ sơ cá nhân",
  logoutText: "Đăng xuất",
};

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: ("owner" | "admin" | "agent")[];
}

export function AdminSidebar({
  onCloseMobile,
  onOpenLogoutModal,
}: AdminSidebarProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);

  const allNavigation: NavItem[] = [
    {
      name: ADMIN_SIDEBAR_TEXT.dashboardText,
      href: "/dashboard",
      icon: LayoutDashboard,
      allowedRoles: ["owner", "admin"],
    },
    {
      name: ADMIN_SIDEBAR_TEXT.chatText,
      href: "/chat",
      icon: MessageSquare,
      allowedRoles: ["owner", "admin", "agent"],
    },
    {
      name: ADMIN_SIDEBAR_TEXT.knowledgeBaseText,
      href: "/knowledge-base",
      icon: FileText,
      allowedRoles: ["owner", "admin"],
    },
    {
      name: ADMIN_SIDEBAR_TEXT.ragTestText,
      href: "/rag-test",
      icon: Sparkles,
      allowedRoles: ["owner", "admin"],
    },
    {
      name: ADMIN_SIDEBAR_TEXT.teamText,
      href: "/team",
      icon: Users,
      allowedRoles: ["owner", "admin"],
    },
    {
      name: ADMIN_SIDEBAR_TEXT.workspaceSettingsText,
      href: "/workspace-settings",
      icon: Bot,
      allowedRoles: ["owner", "admin"],
    },
    {
      name: ADMIN_SIDEBAR_TEXT.profileText,
      href: "/profile",
      icon: LayoutDashboard,
      allowedRoles: ["owner", "admin", "agent"],
    },
  ];

  const navigation = allNavigation.filter((item) =>
    user?.role ? item.allowedRoles.includes(user.role) : false,
  );

  return (
    <div className="flex h-full flex-col justify-between bg-card text-card-foreground">
      <div className="px-4 py-6">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 select-none">
          <div className="h-6 w-6 shrink-0">
            <img
              src={logo}
              alt="SupportFlow AI Logo"
              className="h-full w-full"
            />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground font-sans">
            Support<span className="text-primary">Flow</span>
          </span>
        </div>

        <Separator className="my-6 bg-border" />

        {/* Navigation */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-secondary text-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 flex items-center"
          onClick={onOpenLogoutModal}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {ADMIN_SIDEBAR_TEXT.logoutText}
        </Button>
      </div>
    </div>
  );
}
