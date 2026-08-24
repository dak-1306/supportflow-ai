import React, { useCallback } from "react";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import { useConversationsQuery } from "@/features/chat/hooks/useChatQueries";
import { ScrollArea } from "@supportflow/ui/src/components/ui/scroll-area";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import { Skeleton } from "@supportflow/ui/src/components/ui/skeleton";
import { IConversation } from "@/features/chat/types";
import { ConversationStatus } from "@supportflow/shared-types";
import { ConversationItem } from "./ConversationItem";
import { ConversationTabs } from "./ConversationTabs";

const SIDEBAR_TEXT = {
  aiText: "Danh sách AI tự động",
  waitingAdminText: "Hội thoại chờ tiếp quản",
  humanText: "Admin đang tiếp quản",
  resolvedText: "Đã hoàn thành",
  totalText: "Tổng số hội thoại",
  noConversationsText: "Không có hội thoại nào trong mục này",

  errorText: "Lỗi tải dữ liệu hội thoại.",
};

export const SidebarConversations: React.FC = () => {
  const {
    activeConversationId,
    setActiveConversationId,
    activeConversationStatus,
    setActiveConversationStatus,
  } = useAdminChatStore();

  const currentTab = activeConversationStatus || "AI";
  const {
    data: conversationResponse,
    isLoading,
    error,
  } = useConversationsQuery(currentTab);

  const conversations: IConversation[] =
    conversationResponse?.conversations || [];
  const total = conversationResponse?.total || 0;

  const handleSelectChat = useCallback(
    (chat: IConversation) => {
      setActiveConversationId(chat.id);
      setActiveConversationStatus(chat.status as ConversationStatus);
    },
    [setActiveConversationId, setActiveConversationStatus],
  );

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
        {SIDEBAR_TEXT.errorText}
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border bg-card h-full flex flex-col shrink-0">
      <ConversationTabs
        currentTab={currentTab}
        onTabChange={(status) => {
          setActiveConversationStatus(status);
          setActiveConversationId(null);
        }}
      />

      <div className="p-3 border-b border-border flex items-center justify-between shrink-0 bg-card">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {currentTab === "AI" && SIDEBAR_TEXT.aiText}
          {currentTab === "WAITING_ADMIN" && SIDEBAR_TEXT.waitingAdminText}
          {currentTab === "HUMAN" && SIDEBAR_TEXT.humanText}
          {currentTab === "RESOLVED" && SIDEBAR_TEXT.resolvedText}
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
              {SIDEBAR_TEXT.noConversationsText}
            </div>
          ) : (
            conversations.map((chat) => (
              <ConversationItem
                key={chat.id}
                chat={chat}
                isActive={activeConversationId === chat.id}
                onSelect={handleSelectChat}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
