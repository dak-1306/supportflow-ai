import React, { useState, useRef, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import { useAdminChatSocket } from "@/features/chat/hooks/useAdminChatSocket";
import {
  useMessagesQuery,
  useSendMessageMutation,
  useTakeOverMutation,
  useResolveMutation,
  useEnableAIMutation,
} from "@/features/chat/hooks/useChatQueries";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { IMessage } from "@supportflow/shared-types";
import { ChatMessageItem } from "./ChatMessageItem";
import { ChatHeaderBanner, ConfirmType } from "./ChatHeaderBanner";
import { ChatInput } from "./ChatInput";

const CHAT_WINDOW_TEXT = {
  noConversationSelectedText: "Chưa có hội thoại nào được chọn",
  syncingConversationText: "Đang đồng bộ hội thoại...",
  viewOlderMessagesText: "Xem tin nhắn cũ hơn",
  customerTypingText: "Khách hàng đang nhập tin nhắn...",
  resolveModal: {
    title: "Xác nhận hoàn thành",
    description:
      "Bạn có chắc chắn muốn đánh dấu hội thoại này là hoàn thành không?",
    confirmText: "Hoàn thành",
  },
  enableAIBotModal: {
    title: "Xác nhận bật AI Bot",
    description:
      "Bạn có chắc chắn muốn bật lại AI Bot cho hội thoại này không?",
    confirmText: "Bật AI Bot",
  },
  takeOverModal: {
    title: "Xác nhận tiếp quản hội thoại",
    description: "Bạn có chắc chắn muốn tiếp quản hội thoại này không?",
    confirmText: "Tiếp quản",
  },
};
export const ChatWindow: React.FC = () => {
  const activeConversationId = useAdminChatStore((s) => s.activeConversationId);
  const activeConversationStatus = useAdminChatStore(
    (s) => s.activeConversationStatus,
  );
  const isCustomerTyping = useAdminChatStore((s) => s.isCustomerTyping);

  const { emitAdminTyping } = useAdminChatSocket();

  const [page, setPage] = useState(1);
  const [confirmType, setConfirmType] = useState<ConfirmType>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isPaginatingRef = useRef(false);

  const { data, isLoading, isFetching } = useMessagesQuery(
    activeConversationId,
    page,
  );
  const sendMessageMutation = useSendMessageMutation(activeConversationId);
  const takeOverMutation = useTakeOverMutation();
  const resolveMutation = useResolveMutation();
  const enableAIMutation = useEnableAIMutation();

  const messages: IMessage[] = data?.messages || [];
  const totalInDb = data?.total || 0;
  const conversationStatus = activeConversationStatus || data?.status || "AI";

  useEffect(() => {
    setPage(1);
    isPaginatingRef.current = false;
  }, [activeConversationId]);

  useEffect(() => {
    if (!isPaginatingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    isPaginatingRef.current = false;
  }, [messages.length, isCustomerTyping]);

  if (!activeConversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground p-8 text-center select-none">
        <Sparkles className="h-8 w-8 text-muted-foreground/40 mb-3 animate-pulse" />
        <p className="text-sm font-medium">
          {CHAT_WINDOW_TEXT.noConversationSelectedText}
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-sm text-muted-foreground">
        {CHAT_WINDOW_TEXT.syncingConversationText}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background/50 h-full min-h-0 overflow-hidden">
      <ChatHeaderBanner
        status={conversationStatus}
        isTakeOverPending={takeOverMutation.isPending}
        isEnableAIPending={enableAIMutation.isPending}
        isResolvePending={resolveMutation.isPending}
        onOpenModal={(type) => setConfirmType(type)}
      />

      {/* VÙNG TIN NHẮN */}
      <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
        {messages.length < totalInDb && (
          <div className="flex items-center justify-center py-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isFetching}
              onClick={() => {
                isPaginatingRef.current = true;
                setPage((prev) => prev + 1);
              }}
              className="text-xs h-8 rounded-full px-4"
            >
              {isFetching
                ? "Đang xử lý..."
                : CHAT_WINDOW_TEXT.viewOlderMessagesText}
            </Button>
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} msg={msg} />
        ))}

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

      <ChatInput
        conversationStatus={conversationStatus}
        isSending={sendMessageMutation.isPending}
        onAdminTyping={emitAdminTyping}
        onSend={(msgText) => {
          isPaginatingRef.current = false;
          sendMessageMutation.mutate(msgText);
        }}
      />

      {/* MODALS */}
      <ConfirmModal
        isOpen={confirmType === "RESOLVE"}
        isLoading={resolveMutation.isPending}
        onClose={() => setConfirmType(null)}
        onConfirm={() =>
          resolveMutation.mutate(activeConversationId, {
            onSuccess: () => setConfirmType(null),
          })
        }
        title={CHAT_WINDOW_TEXT.resolveModal.title}
        description={CHAT_WINDOW_TEXT.resolveModal.description}
        confirmText={CHAT_WINDOW_TEXT.resolveModal.confirmText}
        variant="primary"
      />

      <ConfirmModal
        isOpen={confirmType === "ENABLE_AI"}
        isLoading={enableAIMutation.isPending}
        onClose={() => setConfirmType(null)}
        onConfirm={() =>
          enableAIMutation.mutate(activeConversationId, {
            onSuccess: () => setConfirmType(null),
          })
        }
        title={CHAT_WINDOW_TEXT.enableAIBotModal.title}
        description={CHAT_WINDOW_TEXT.enableAIBotModal.description}
        confirmText={CHAT_WINDOW_TEXT.enableAIBotModal.confirmText}
        variant="primary"
      />

      <ConfirmModal
        isOpen={confirmType === "TAKE_OVER"}
        isLoading={takeOverMutation.isPending}
        onClose={() => setConfirmType(null)}
        onConfirm={() =>
          takeOverMutation.mutate(activeConversationId, {
            onSuccess: () => setConfirmType(null),
          })
        }
        title={CHAT_WINDOW_TEXT.takeOverModal.title}
        description={CHAT_WINDOW_TEXT.takeOverModal.description}
        confirmText={CHAT_WINDOW_TEXT.takeOverModal.confirmText}
        variant="primary"
      />
    </div>
  );
};
