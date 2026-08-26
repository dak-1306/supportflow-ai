// shared/config/navigation.ts
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  FileText,
  Sparkles,
  Users,
  User,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: ("owner" | "admin" | "agent")[];
}

export const ROLE_LABELS: Record<string, string> = {
  owner: "Owner (Chủ sở hữu)",
  admin: "Quản trị viên",
  agent: "Tư vấn viên",
};

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    allowedRoles: ["owner", "admin"],
  },
  {
    name: "Hội thoại",
    href: "/chat",
    icon: MessageSquare,
    allowedRoles: ["owner", "admin", "agent"],
  },
  {
    name: "Kiến thức",
    href: "/knowledge-base",
    icon: FileText,
    allowedRoles: ["owner", "admin"],
  },
  {
    name: "RAG Test",
    href: "/rag-test",
    icon: Sparkles,
    allowedRoles: ["owner", "admin"],
  },
  {
    name: "Đội ngũ",
    href: "/team",
    icon: Users,
    allowedRoles: ["owner", "admin"],
  },
  {
    name: "Cấu hình Workspace",
    href: "/workspace-settings",
    icon: Bot,
    allowedRoles: ["owner", "admin"],
  },
  {
    name: "Hồ sơ cá nhân",
    href: "/profile",
    icon: User,
    allowedRoles: ["owner", "admin", "agent"],
  },
];
