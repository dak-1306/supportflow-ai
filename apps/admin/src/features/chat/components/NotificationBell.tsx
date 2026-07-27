// features/notifications/NotificationBell.tsx
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@supportflow/ui/src/components/ui/dropdown-menu";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Lấy state trực tiếp từ Zustand
  const { unreadNotificationCount, notifications, clearUnreadNotifications } =
    useAdminChatStore();

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      clearUnreadNotifications();
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger>
        <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
          <Bell className="h-4 w-4" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground animate-in zoom-in-50">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 bg-card border border-border p-2 shadow-lg"
      >
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm font-semibold text-foreground">
            Thông báo
          </span>
        </div>
        <DropdownMenuSeparator />

        <div className="max-h-[300px] overflow-y-auto space-y-1 my-1">
          {notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Không có thông báo mới
            </div>
          ) : (
            notifications.map((item, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/chat?id=${item.conversationId}`);
                }}
                className="cursor-pointer flex flex-col items-start gap-1 p-2.5 focus:bg-accent rounded-sm"
              >
                <span className="text-xs font-medium text-amber-500">
                  ⚠️ {item.title}
                </span>
                <p className="text-xs text-foreground line-clamp-2">
                  {item.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
