import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Bot, // 🟢 Bổ sung icon Bot
} from "lucide-react";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import { useAdminChatSocket } from "@/features/chat/hooks/useAdminChatSocket";
import {
  useMessagesQuery,
  useSendMessageMutation,
  useTakeOverMutation,
  useResolveMutation,
  useEnableAIMutation, // 🟢 Bổ sung Mutation Bật AI
} from "@/features/chat/hooks/useChatQueries";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Input } from "@supportflow/ui/src/components/ui/input";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { IMessage } from "@supportflow/shared-types";

export const ChatWindow: React.FC = () => {
  const activeConversationId = useAdminChatStore(
    (state) => state.activeConversationId,
  );
  const activeConversationStatus = useAdminChatStore(
    (state) => state.activeConversationStatus,
  );
  const isCustomerTyping = useAdminChatStore((state) => state.isCustomerTyping);
  const isAITyping = useAdminChatStore((state) => state.isAITyping);
  const realtimeMessages = useAdminChatStore((state) => state.realtimeMessages);
  const clearRealtimeMessages = useAdminChatStore(
    (state) => state.clearRealtimeMessages,
  );

  const { emitAdminTyping } = useAdminChatSocket();

  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const [openConfirmResolve, setOpenConfirmResolve] = useState(false); // State quản lý Modal Xác nhận Hoàn thành
  const [openConfirmEnableAI, setOpenConfirmEnableAI] = useState(false); // State quản lý Modal Xác nhận Bật AI
  const [openTakeOverConfirm, setOpenTakeOverConfirm] = useState(false); // State quản lý Modal Xác nhận Take Over

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isFetching } = useMessagesQuery(
    activeConversationId,
    page,
  );
  const sendMessageMutation = useSendMessageMutation(activeConversationId);
  const takeOverMutation = useTakeOverMutation();
  const resolveMutation = useResolveMutation();
  const enableAIMutation = useEnableAIMutation(); // 🟢 Sử dụng Hook Enable AI

  const dbMessages: IMessage[] = data?.messages || [];
  const totalInDb = data?.total || 0;
  const conversationStatus = activeConversationStatus || data?.status || "AI";

  useEffect(() => {
    setPage(1);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (activeConversationId) {
      clearRealtimeMessages(activeConversationId);
    }
  }, [activeConversationId, clearRealtimeMessages]);

  const activeRealtime = activeConversationId
    ? realtimeMessages[activeConversationId] || []
    : [];

  const allMessages: IMessage[] = [...dbMessages, ...activeRealtime].filter(
    (msg, index, self) => self.findIndex((m) => m.id === msg.id) === index,
  );

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

  const handleResolve = () => {
    if (resolveMutation.isPending) return;
    resolveMutation.mutate(activeConversationId);
  };
  const handleAIEnable = () => {
    if (enableAIMutation.isPending) return;
    enableAIMutation.mutate(activeConversationId);
  };
  const handleTakeOver = () => {
    if (takeOverMutation.isPending) return;
    takeOverMutation.mutate(activeConversationId);
  };

  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full min-h-0 overflow-hidden">
      {/* 🌟 HANDOFF HEADER BANNER */}
      {conversationStatus === "WAITING_ADMIN" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-6 flex items-center justify-between shrink-0 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-amber-600 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
            <span>
              AI đã tạm ngưng do độ tin cậy thấp. Khách hàng đang chờ Admin trợ
              giúp!
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setOpenTakeOverConfirm(true)}
            disabled={takeOverMutation.isPending}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3 rounded-lg shadow-sm"
          >
            <UserCheck className="w-3.5 h-3.5 mr-1.5" />
            {takeOverMutation.isPending
              ? "Đang tiếp quản..."
              : "Tiếp Quản Ngay"}
          </Button>
        </div>
      )}

      {/* 🟢 BANNER HUMAN: BỔ SUNG NÚT BẬT LẠI AI BOT */}
      {conversationStatus === "HUMAN" && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-2.5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            <span>Bạn đang tiếp quản hội thoại này (AI đã tắt).</span>
          </div>

          <div className="flex items-center gap-2">
            {/* NÚT BẬT AI BOT */}
            <button
              className="bg-purple-500 hover:bg-purple-600 text-white text-xs h-8 px-3 rounded-lg shadow-sm flex items-center"
              onClick={() => setOpenConfirmEnableAI(true)}
              disabled={enableAIMutation.isPending}
            >
              <Bot className="w-3.5 h-3.5 mr-1 text-white" />
              {enableAIMutation.isPending ? "Đang bật..." : "Bật AI Bot"}
            </button>

            {/* NÚT HOÀN THÀNH */}
            <button
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-3 rounded-lg shadow-sm flex items-center"
              onClick={() => setOpenConfirmResolve(true)}
              disabled={resolveMutation.isPending}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Hoàn thành
            </button>
          </div>
        </div>
      )}

      {/* VÙNG TIN NHẮN */}
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
                {msgTime} {isAI && "• Trợ lý AI"} {isAdmin && "• Admin"}
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

        <div ref={messagesEndRef} />
      </div>

      {/* VÙNG NHẬP LIỆU */}
      <div className="p-4 bg-card border-t border-border shrink-0">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 max-w-5xl mx-auto"
        >
          <Input
            type="text"
            value={text}
            onChange={handleInputChange}
            placeholder={
              conversationStatus === "WAITING_ADMIN"
                ? "Bấm 'Tiếp Quản Ngay' hoặc gõ tin nhắn để trả lời khách..."
                : "Nhập phản hồi trực tiếp tới khách hàng..."
            }
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
      {/* MODAL XÁC NHẬN HOÀN THÀNH */}
      <ConfirmModal
        isOpen={openConfirmResolve}
        isLoading={resolveMutation.isPending}
        onClose={() => setOpenConfirmResolve(false)}
        onConfirm={handleResolve}
        title="Xác nhận hoàn thành"
        description="Bạn có chắc chắn muốn đánh dấu hội thoại này là hoàn thành không?"
        confirmText="Hoàn thành"
        cancelText="Hủy"
        variant="primary"
      />
      {/* MODAL XÁC NHẬN BẬT AI BOT */}
      <ConfirmModal
        isOpen={openConfirmEnableAI}
        isLoading={enableAIMutation.isPending}
        onClose={() => setOpenConfirmEnableAI(false)}
        onConfirm={handleAIEnable}
        title="Xác nhận bật AI Bot"
        description="Bạn có chắc chắn muốn bật lại AI Bot cho hội thoại này không?"
        confirmText="Bật AI Bot"
        cancelText="Hủy"
        variant="primary"
      />
      {/* MODAL XÁC NHẬN TAKE OVER */}
      <ConfirmModal
        isOpen={openTakeOverConfirm}
        isLoading={takeOverMutation.isPending}
        onClose={() => setOpenTakeOverConfirm(false)}
        onConfirm={handleTakeOver}
        title="Xác nhận tiếp quản hội thoại"
        description="Bạn có chắc chắn muốn tiếp quản hội thoại này không?"
        confirmText="Tiếp quản"
        cancelText="Hủy"
        variant="primary"
      />
    </div>
  );
};
