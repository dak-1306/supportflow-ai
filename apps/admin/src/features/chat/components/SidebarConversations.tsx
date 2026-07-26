import React from "react";
import { useAdminChatStore } from "../stores/chat.store";
import { useConversationsQuery } from "../hooks/useChatQueries";
import { ScrollArea } from "@supportflow/ui/src/components/ui/scroll-area";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import { Skeleton } from "@supportflow/ui/src/components/ui/skeleton";
import { IConversation } from "../types/index";
import { ShieldAlert, Bot, UserCheck } from "lucide-react";
import { ConversationStatus } from "@supportflow/shared-types";

// Config ngắn gọn cho Navigation Tabs
const TAB_CONFIGS: {
  status: ConversationStatus;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    status: "AI",
    label: "AI Bot",
    icon: <Bot className="w-3 h-3 text-purple-500" />,
    activeClass: "bg-background text-foreground shadow-sm",
  },
  {
    status: "WAITING_ADMIN",
    label: "Cần xử lý",
    icon: <ShieldAlert className="w-3 h-3 text-amber-500 animate-pulse" />,
    activeClass:
      "bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/30",
  },
  {
    status: "HUMAN",
    label: "Đang hỗ trợ",
    icon: <UserCheck className="w-3 h-3 text-emerald-500" />,
    activeClass: "bg-background text-foreground shadow-sm",
  },
];

export const SidebarConversations: React.FC = () => {
  const {
    activeConversationId,
    setActiveConversationId,
    activeConversationStatus,
    setActiveConversationStatus,
  } = useAdminChatStore();

  // Tab mặc định nếu store chưa có
  const currentTab = activeConversationStatus || "AI";

  const {
    data: conversationResponse,
    isLoading,
    error,
  } = useConversationsQuery(currentTab);

  const conversations: IConversation[] =
    conversationResponse?.conversations || [];
  const total = conversationResponse?.total || 0;

  // Hàm chuyển tab tập trung
  const handleTabChange = (status: ConversationStatus) => {
    setActiveConversationStatus(status);
    // Khi bấm đổi tab thủ công -> clear conversation active
    setActiveConversationId(null);
  };

  if (isLoading) {
    return (
      <div className="w-80 border-r border-border bg-card h-full flex flex-col p-4 space-y-4 shrink-0">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex-1 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-80 border-r border-border bg-card h-full flex items-center justify-center p-4 text-sm text-destructive shrink-0">
        Lỗi tải dữ liệu hội thoại.
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-card h-full flex flex-col shrink-0">
      {/* Tab Navigation Clean */}
      <div className="p-2 border-b border-border grid grid-cols-3 gap-1 bg-muted/30 shrink-0">
        {TAB_CONFIGS.map((tab) => (
          <button
            key={tab.status}
            onClick={() => handleTabChange(tab.status)}
            className={`py-1.5 px-2 text-[11px] font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
              currentTab === tab.status
                ? tab.activeClass
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {currentTab === "AI" && "Danh sách AI tự động"}
          {currentTab === "WAITING_ADMIN" && "Hội thoại chờ tiếp quản"}
          {currentTab === "HUMAN" && "Admin đang tiếp quản"}
          {currentTab === "RESOLVED" && "Đã hoàn thành"}
        </h2>
        <Badge
          variant="secondary"
          className="font-mono rounded-full px-2 py-0 text-xs"
        >
          {total}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              Không có hội thoại nào trong mục này
            </div>
          ) : (
            conversations.map((chat) => {
              const isActive = activeConversationId === chat.id;
              const formattedTime = new Date(chat.updatedAt).toLocaleTimeString(
                "vi-VN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveConversationId(chat.id);
                    setActiveConversationStatus(
                      chat.status as ConversationStatus,
                    );
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex flex-col gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring relative ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : chat.status === "WAITING_ADMIN"
                        ? "bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20"
                        : "hover:bg-secondary/60 text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-medium text-sm truncate">
                      User #{chat.customerId.slice(-6).toUpperCase()}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isActive
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formattedTime}
                    </span>
                  </div>

                  {chat.lastMessage && (
                    <p
                      className={`text-xs truncate w-full ${
                        isActive
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}
                    >
                      {chat.lastMessage}
                    </p>
                  )}

                  <div className="flex gap-1 mt-0.5">
                    {chat.status === "WAITING_ADMIN" && (
                      <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 rounded animate-bounce">
                        ⚠️ Cần Admin
                      </Badge>
                    )}
                    {chat.status === "HUMAN" && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] px-1.5 py-0 rounded">
                        Admin Tiếp Quản
                      </Badge>
                    )}
                    {chat.status === "AI" && (
                      <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 uppercase font-medium ${
                          isActive
                            ? "border-primary-foreground text-primary-foreground"
                            : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                        }`}
                      >
                        AI Bot
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
