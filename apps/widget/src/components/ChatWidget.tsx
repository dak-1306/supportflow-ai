import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useChatSocket } from "../hooks/useChatSocket";
import {
  useWidgetMessagesQuery,
  useWidgetSendMessageMutation,
} from "../hooks/useChatQueries";
import { chatApi } from "../services/api";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Card } from "@supportflow/ui/src/components/ui/card";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInputForm } from "./ChatInputForm";

export const ChatWidget: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    customerId,
    conversationId,
    setChatSession,
    unreadCount,
  } = useChatStore();
  const [page, setPage] = useState(1);
  const [initLoading, setInitLoading] = useState(false);

  const { emitTypingStatus } = useChatSocket(page, 50);
  const {
    data,
    isLoading: queryLoading,
    isFetching,
  } = useWidgetMessagesQuery(conversationId, page);
  const sendMessageMutation = useWidgetSendMessageMutation(conversationId);

  const dbMessages = data?.messages || [];
  const totalInDb = data?.total || 0;
  const showLoader =
    initLoading || (!!conversationId && queryLoading && page === 1);

  const handleToggleWidget = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !conversationId) {
      try {
        setInitLoading(true);
        const res = await chatApi.initConversation(customerId);
        setChatSession(res.customerId, res.conversation.id);
        setPage(1);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setInitLoading(false);
      }
    }
  };

  const handleSend = (text: string) => {
    sendMessageMutation.mutate(text);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans flex flex-col items-end antialiased">
      {isOpen && (
        <Card className="border border-border bg-card shadow-md w-[380px] h-[550px] max-w-[calc(100vw-40px)] flex flex-col mb-4 overflow-hidden rounded-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <ChatHeader onClose={handleToggleWidget} />

          <ChatMessages
            messages={dbMessages}
            totalInDb={totalInDb}
            showLoader={showLoader}
            isFetching={isFetching}
            onLoadMore={() => setPage((prev) => prev + 1)}
          />

          <ChatInputForm
            onSendMessage={handleSend}
            onTyping={emitTypingStatus}
            isPending={sendMessageMutation.isPending}
          />
        </Card>
      )}

      <Button
        onClick={handleToggleWidget}
        size="icon"
        className="relative h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform duration-150 flex items-center justify-center"
        aria-label="Mở khung hỗ trợ"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}

        {/* 🟢 HIỂN THỊ BADGE THÔNG BÁO TIN NHẮN MỚI KHI ĐÓNG WIDGET */}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground animate-bounce shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
    </div>
  );
};
