import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { useAdminChatStore } from "../stores/chat.store";
import { useAdminChatSocket } from "../hooks/useAdminChatSocket";
import {
  useMessagesQuery,
  useSendMessageMutation,
} from "../hooks/useChatQueries";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Input } from "@supportflow/ui/src/components/ui/input";
import { ScrollArea } from "@supportflow/ui/src/components/ui/scroll-area";
import { IMessage } from "@supportflow/shared-types";

export const ChatWindow: React.FC = () => {
  // Tối ưu render bằng Zustand Selector
  const activeConversationId = useAdminChatStore(
    (state) => state.activeConversationId,
  );
  const isCustomerTyping = useAdminChatStore((state) => state.isCustomerTyping);
  const isAITyping = useAdminChatStore((state) => state.isAITyping); // Lấy thêm state này
  const realtimeMessages = useAdminChatStore((state) => state.realtimeMessages);
  const clearRealtimeMessages = useAdminChatStore(
    (state) => state.clearRealtimeMessages,
  );

  const { emitAdminTyping } = useAdminChatSocket();

  const [page, setPage] = useState(1);
  const [text, setText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isFetching } = useMessagesQuery(
    activeConversationId,
    page,
  );
  const sendMessageMutation = useSendMessageMutation(activeConversationId);

  const dbMessages: IMessage[] = data?.messages || [];
  const totalInDb = data?.total || 0;

  // Dọn dẹp trạng thái khi chuyển phòng chat
  useEffect(() => {
    setPage(1);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Tùy chọn: Xóa tin nhắn realtime cũ của phòng này vì đã có dbMessages lo liệu khi load lại
    if (activeConversationId) {
      clearRealtimeMessages(activeConversationId);
    }
  }, [activeConversationId, clearRealtimeMessages]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const activeRealtime = activeConversationId
    ? realtimeMessages[activeConversationId] || []
    : [];

  // Gộp sạch sẽ dựa trên trường 'id' đã chuẩn hóa ở Server
  const allMessages: IMessage[] = [...dbMessages, ...activeRealtime].filter(
    (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index,
  );

  // Cuộn xuống mượt mà
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isCustomerTyping, isAITyping]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground p-8 text-center select-none">
        <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-3 animate-pulse" />
        <p className="text-sm font-medium">Chưa có hội thoại nào được chọn</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-sm text-muted-foreground">
        Đang đồng bộ hội thoại...
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    emitAdminTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitAdminTyping(false), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || sendMessageMutation.isPending) return;
    const msgText = text.trim();
    setText("");
    emitAdminTyping(false);
    sendMessageMutation.mutate(msgText);
  };

  return (
    // Bọc ngoài cùng bằng flex flex-col h-full min-h-0
    <div className="flex-1 flex flex-col bg-background/50 h-full min-h-0 overflow-hidden">
      {/* VÙNG TIN NHẮN: Đặt overflow-y-auto trực tiếp tại đây để scroll nội bộ */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
        {dbMessages.length < totalInDb && (
          <div className="flex items-center justify-center py-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => setPage((prev) => prev + 1)}
              className="text-xs h-8 rounded-full px-4"
            >
              {isFetching ? "Đang xử lý..." : "Xem tin nhắn cũ hơn"}
            </Button>
          </div>
        )}

        {allMessages.map((msg) => {
          const isAdmin = msg.sender === "ADMIN";
          const isAI = msg.sender === "AI";
          const msgTime = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[75%] ${isAdmin ? "ml-auto items-end" : "mr-auto items-start"}`}
            >
              <div
                className={`px-4 py-2.5 text-sm rounded-xl shadow-sm leading-relaxed whitespace-pre-wrap ${
                  isAdmin
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : isAI
                      ? "bg-purple-500/10 text-purple-700 border border-purple-200 rounded-tl-none font-medium"
                      : "bg-card text-foreground border border-border rounded-tl-none"
                }`}
              >
                {isAI && (
                  <span className="text-[10px] block text-purple-500 uppercase font-bold tracking-wider mb-1">
                    AI Assistant
                  </span>
                )}
                {msg.message}
              </div>
              <span className="text-[10px] text-muted-foreground/60 px-1">
                {msgTime} {isAI && "• Trợ lý AI"}
              </span>
            </div>
          );
        })}

        {isCustomerTyping && (
          <div className="flex justify-start mr-auto">
            <div className="bg-card border border-border rounded-xl rounded-tl-none px-4 py-3.5 flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300"></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300 delay-75"></span>
              <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300 delay-150"></span>
            </div>
          </div>
        )}
        {isAITyping && (
          <div className="flex justify-start mr-auto">
            <div className="bg-purple-500/5 border border-purple-200/50 rounded-xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
              <span className="text-xs text-purple-500 font-medium mr-1 animate-pulse">
                AI đang phân tích...
              </span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce duration-300"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce duration-300 delay-75"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce duration-300 delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* VÙNG NHẬP LIỆU: Cố định sát đáy */}
      <div className="p-4 bg-card border-t border-border shrink-0">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 max-w-5xl mx-auto"
        >
          <Input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder="Nhập phản hồi trực tiếp tới khách hàng..."
            className="flex-1 bg-background border-input px-4 py-2.5 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            disabled={!text.trim() || sendMessageMutation.isPending}
            size="icon"
            className="h-10 w-10 shrink-0 flex items-center"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
