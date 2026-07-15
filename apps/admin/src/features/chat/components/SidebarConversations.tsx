import React from "react";
import { useAdminChatStore } from "../stores/chat.store";
import { useConversationsQuery } from "../hooks/useChatQueries";
import { ScrollArea } from "@supportflow/ui/src/components/ui/scroll-area";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import { Skeleton } from "@supportflow/ui/src/components/ui/skeleton";
import { IConversation } from "../types/index";

export const SidebarConversations: React.FC = () => {
  const { activeConversationId, setActiveConversationId } = useAdminChatStore();
  const {
    data: conversationResponse,
    isLoading,
    error,
  } = useConversationsQuery("AI");

  const conversations: IConversation[] =
    conversationResponse?.conversations || [];
  const total = conversationResponse?.total || 0;

  if (isLoading) {
    return (
      <div className="w-80 border-r border-border bg-card h-full flex flex-col p-4 space-y-4 shrink-0">
        <div className="space-y-2">
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
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
      <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          Khách hàng trực tuyến
        </h2>
        <Badge variant="secondary" className="font-mono rounded-full px-2 py-0">
          {total}
        </Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          {conversations.map((chat) => {
            const isActive = activeConversationId === chat.id;
            // Format nhanh thời gian cập nhật
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
                onClick={() => setActiveConversationId(chat.id)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex flex-col gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-secondary/60 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <span className="font-medium text-sm truncate">
                    User #{chat.customerId.slice(-6).toUpperCase()}
                  </span>
                  <span
                    className={`text-[10px] font-mono ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {formattedTime}
                  </span>
                </div>

                {chat.lastMessage && (
                  <p
                    className={`text-xs truncate w-full ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                  >
                    {chat.lastMessage}
                  </p>
                )}

                {/* Tag hiển thị trạng thái AI / Trực tiếp */}
                <div className="flex gap-1 mt-0.5">
                  <Badge
                    variant="outline"
                    className={`text-[9px] px-1 py-0 uppercase tracking-wider rounded font-medium ${
                      chat.status === "AI"
                        ? isActive
                          ? "border-primary-foreground text-primary-foreground"
                          : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                        : isActive
                          ? "border-primary-foreground text-primary-foreground"
                          : "bg-green-500/10 text-green-500 border-green-500/20"
                    }`}
                  >
                    {chat.status === "AI" ? "AI Bot" : "Ủy quyền Admin"}
                  </Badge>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
