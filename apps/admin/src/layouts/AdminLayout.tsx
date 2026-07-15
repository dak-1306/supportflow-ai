import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Menu,
  Bot,
} from "lucide-react";
import logo from "@supportflow/ui/src/assets/logo.svg";
import { useAuthStore } from "../stores/auth.store";
// Shadcn UI Components
import { Button } from "@supportflow/ui/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@supportflow/ui/src/components/ui/sheet";
import { Separator } from "@supportflow/ui/src/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@supportflow/ui/src/components/ui/dropdown-menu";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Hội thoại", href: "/chat", icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Component Sidebar dùng chung cho cả Desktop và Mobile Drawer
  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between bg-card text-card-foreground">
      <div className="px-4 py-6">
        {/* Logo SupportFlow AI */}
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

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileOpen(false)}
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

      {/* Nút đăng xuất nằm cuối Sidebar */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-center gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 flex items-center"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* SIDEBAR FIXED (Chỉ hiển thị trên Desktop) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
        <SidebarContent />
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col md:pl-64">
        {/* HEADER */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-border bg-background/85 backdrop-blur px-6">
          {/* Nút Menu Hamburger cho Mobile */}
          <div className="flex items-center md:hidden">
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              {/* GIẢI QUYẾT LỖI Type 'asChild' bằng việc đưa Button làm phần tử kích hoạt trực tiếp */}
              <SheetTrigger>
                <div className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9 text-muted-foreground">
                  <Menu className="h-5 w-5" />
                </div>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-64 border-r border-border"
              >
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>

          {/* Breadcrumb / Page Title */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-muted-foreground">Hệ thống</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground capitalize">
              {location.pathname.replace("/", "") || "Dashboard"}
            </span>
          </div>

          {/* User Profile Dropdown */}
          <div className="flex items-center gap-4">
            <DropdownMenu>
              {/* FIX TRẮNG MÀN HÌNH: Dùng phần tử HTML thô (div) thay vì Button Component để Radix UI map Ref an toàn */}
              <DropdownMenuTrigger>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-primary border border-border hover:bg-secondary/80 transition-colors cursor-pointer">
                  <Bot className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-card border border-border p-4 shadow-md"
              >
                {/* Đã đổi từ DropdownMenuLabel thành thẻ div thường với style tương đương */}
                <div className="pe-2 py-2 text-sm font-semibold text-foreground">
                  Tài khoản Admin
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate("/settings")}
                  className="cursor-pointer focus:bg-accent focus:text-accent-foreground flex items-center gap-2"
                >
                  Cài đặt hệ thống
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:bg-destructive/5 cursor-pointer"
                >
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-6 lg:p-8 bg-background">
          <div className="max-w-7xl mx-auto h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
