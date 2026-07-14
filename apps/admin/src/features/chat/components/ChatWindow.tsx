import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useAdminChatStore } from "../stores/chat.store";
import { useAdminChatSocket } from "../hooks/useAdminChatSocket";
import {
  useMessagesQuery,
  useSendMessageMutation,
} from "../hooks/useChatQueries";

export const ChatWindow: React.FC = () => {
  const { activeConversationId, isCustomerTyping, realtimeMessages } =
    useAdminChatStore();
  const { emitAdminTyping } = useAdminChatSocket();

  const [page, setPage] = useState(1);

  // Gọi Custom Hooks React Query đã đóng gói logic
  const { data, isLoading, isFetching } = useMessagesQuery(
    activeConversationId,
    page,
  );
  const sendMessageMutation = useSendMessageMutation(activeConversationId);

  const dbMessages = data?.messages || []; // Bóc tách mảng tin nhắn từ DB ra đây
  const totalInDb = data?.total || 0; // Số lượng tin nhắn hiện tại có trong DB

  // Reset page về 1 mỗi khi chuyển phòng chat
  useEffect(() => {
    setPage(1);
  }, [activeConversationId]);

  const [text, setText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Gộp dữ liệu hiển thị (Lịch sử DB + Tin nhắn Realtime qua socket)
  const activeRealtime = activeConversationId
    ? realtimeMessages[activeConversationId] || []
    : [];
  const allMessages = [...dbMessages, ...activeRealtime].filter(
    (msg, index, self) => self.findIndex((m) => m._id === msg._id) === index,
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, isCustomerTyping]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-gray-400">
        Chọn một cuộc hội thoại để bắt đầu hỗ trợ
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 text-gray-400">
        Đang tải tin nhắn...
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
    <div className="flex-1 flex flex-col bg-slate-50 h-full">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {dbMessages.length < totalInDb && (
          <div className="flex justify-center my-2">
            <button
              type="button"
              disabled={isFetching}
              onClick={() => setPage((prev) => prev + 1)}
              className="text-xs text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {isFetching ? "Đang tải..." : "Tải thêm tin nhắn cũ"}
            </button>
          </div>
        )}

        {allMessages.map((msg) => {
          const isAdmin = msg.sender === "ADMIN";
          return (
            <div
              key={msg._id}
              className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm ${
                  isAdmin
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-gray-200 rounded-bl-none"
                }`}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        {isCustomerTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="p-4 bg-white border-t border-gray-200 flex gap-2"
      >
        <input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder="Nhập phản hồi của bạn..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim() || sendMessageMutation.isPending}
          className="bg-slate-900 text-white p-2 rounded-xl disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
