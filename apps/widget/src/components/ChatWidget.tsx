import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useChatSocket } from "../hooks/useChatSocket";
import {
  useWidgetMessagesQuery,
  useWidgetSendMessageMutation,
} from "../hooks/useChatQueries";
import { chatApi } from "../services/api";

export const ChatWidget: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    customerId,
    conversationId,
    setChatSession,
    isAdminTyping,
  } = useChatStore();

  const [page, setPage] = useState(1);
  const [initLoading, setInitLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { emitTypingStatus } = useChatSocket();

  // Truy vấn tin nhắn từ React Query Hook
  const {
    data,
    isLoading: queryLoading,
    isFetching,
  } = useWidgetMessagesQuery(conversationId, page);
  const sendMessageMutation = useWidgetSendMessageMutation(conversationId);

  const dbMessages = data?.messages || [];
  const totalInDb = data?.total || 0;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cuộn xuống tin nhắn mới nhất khi nhận tin mới hoặc trạng thái đang gõ thay đổi
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dbMessages, isAdminTyping]);

  // Khởi tạo cuộc hội thoại khi mở widget lần đầu
  const handleToggleWidget = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !conversationId) {
      try {
        setInitLoading(true);
        const data = await chatApi.initConversation(customerId);
        setChatSession(data.customerId, data.conversation._id);
        setPage(1);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setInitLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    emitTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStatus(false);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId || sendMessageMutation.isPending)
      return;

    const text = inputValue.trim();
    setInputValue("");
    emitTypingStatus(false);

    sendMessageMutation.mutate(text);
  };

  const showLoader =
    initLoading || (conversationId && queryLoading && page === 1);

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans flex flex-col items-end">
      {isOpen && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-[380px] h-[550px] max-w-[calc(100vw-40px)] flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Hỗ trợ trực tuyến</h3>
              <p className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                AI & Đội ngũ hỗ trợ
              </p>
            </div>
            <button
              onClick={handleToggleWidget}
              className="hover:bg-slate-800 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Khung chứa nội dung tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {showLoader ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-500">
                Đang kết nối...
              </div>
            ) : (
              <>
                {/* Nút "Xem tin nhắn cũ hơn" phục vụ cơ chế phân trang */}
                {dbMessages.length < totalInDb && (
                  <div className="flex justify-center my-1">
                    <button
                      type="button"
                      disabled={isFetching}
                      onClick={() => setPage((prev) => prev + 1)}
                      className="text-xs text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                    >
                      {isFetching ? "Đang tải..." : "Tải tin nhắn cũ"}
                    </button>
                  </div>
                )}

                {dbMessages.map((msg) => {
                  const isCustomer = msg.sender === "CUSTOMER";
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                          isCustomer
                            ? "bg-slate-900 text-white rounded-br-none"
                            : "bg-white border border-gray-200 text-slate-800 rounded-bl-none"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

            {/* Trạng thái typing */}
            {isAdminTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ô nhập dữ liệu gửi tin */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white border-t border-gray-100 flex gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Nhập tin nhắn của bạn..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-slate-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || sendMessageMutation.isPending}
              className="bg-slate-900 hover:bg-slate-800 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Nút bong bóng kích hoạt */}
      <button
        onClick={handleToggleWidget}
        className="bg-slate-900 hover:bg-slate-800 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 duration-100"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};
