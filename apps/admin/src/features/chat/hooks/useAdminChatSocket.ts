import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { chatKeys } from "@/features/chat/hooks/useChatQueries";
import {
  IMessage,
  ConversationStatus,
  MessageSender,
  SOCKET_EVENTS,
  MESSAGE_SENDER,
  CONVERSATION_STATUS,
} from "@supportflow/shared-types";
import { notificationSound } from "@supportflow/assets";
import { adminSocket } from "@/features/chat/libs/adminSocket";

interface MessagesData {
  messages: IMessage[];
  total: number;
}

export const useAdminChatSocket = () => {
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.user?.workspaceId);
  const processedMessageIds = useRef(new Set<string>());

  const {
    activeConversationId,
    setActiveConversationStatus,
    setCustomerTyping,
    setAITyping,
    addNotification,
  } = useAdminChatStore();

  const activeIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const playSound = useCallback(() => {
    try {
      const audio = new Audio(notificationSound);
      audio.play().catch(() => {});
    } catch (e) {}
  }, []);

  // 🟢 1. JOIN/LEAVE ROOM
  useEffect(() => {
    if (!adminSocket) return;

    if (workspaceId) {
      adminSocket.emit(SOCKET_EVENTS.JOIN_WORKSPACE, { workspaceId });
    }

    if (activeConversationId) {
      adminSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
        conversationId: activeConversationId,
      });
    }

    return () => {
      if (activeConversationId) {
        adminSocket.emit(SOCKET_EVENTS.LEAVE_ROOM, {
          conversationId: activeConversationId,
        });
      }
    };
  }, [activeConversationId, workspaceId]);

  // 🟢 2. KHỞI TẠO LISTENERS
  useEffect(() => {
    const handleConnect = () => {
      if (workspaceId) {
        adminSocket.emit(SOCKET_EVENTS.JOIN_WORKSPACE, { workspaceId });
      }
      if (activeIdRef.current) {
        adminSocket.emit(SOCKET_EVENTS.JOIN_ROOM, {
          conversationId: activeIdRef.current,
        });
      }
    };

    const handleNewMessage = (
      rawMessage: IMessage & { conversationStatus?: ConversationStatus },
    ) => {
      const msgId = rawMessage.id;

      if (msgId) {
        if (processedMessageIds.current.has(msgId)) return;
        processedMessageIds.current.add(msgId);
        setTimeout(() => processedMessageIds.current.delete(msgId), 5000);
      }

      const convIdStr = String(rawMessage.conversationId);

      queryClient.setQueriesData<MessagesData>(
        { queryKey: chatKeys.messages.list(convIdStr, 1) },
        (oldData) => {
          if (!oldData) return { messages: [rawMessage], total: 1 };
          const existing = oldData.messages || [];

          if (existing.some((m) => m.id === msgId)) {
            return oldData;
          }

          return {
            ...oldData,
            messages: [...existing, rawMessage],
            total: (oldData.total || 0) + 1,
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: chatKeys.conversations.all });

      if (
        rawMessage.sender === MESSAGE_SENDER.CUSTOMER &&
        rawMessage.conversationStatus !== CONVERSATION_STATUS.AI
      ) {
        playSound();
      }
    };

    const handleWorkspaceMessage = (
      rawMessage: IMessage & { conversationStatus?: ConversationStatus },
    ) => {
      const convIdStr = String(rawMessage.conversationId);
      const currentActiveId = activeIdRef.current
        ? String(activeIdRef.current)
        : null;

      queryClient.invalidateQueries({ queryKey: chatKeys.conversations.all });

      if (
        rawMessage.sender === MESSAGE_SENDER.CUSTOMER &&
        rawMessage.conversationStatus !== CONVERSATION_STATUS.AI &&
        convIdStr !== currentActiveId
      ) {
        playSound();
        addNotification({
          conversationId: convIdStr,
          type:
            rawMessage.conversationStatus === CONVERSATION_STATUS.WAITING_ADMIN
              ? "WAITING_HANDOFF"
              : "CUSTOMER_MESSAGE",
          title:
            rawMessage.conversationStatus === CONVERSATION_STATUS.WAITING_ADMIN
              ? "Cần hỗ trợ gấp!"
              : "Tin nhắn mới",
          message: rawMessage.message || "Khách hàng đã gửi một tin nhắn.",
          createdAt: new Date().toISOString(),
        });
      }
    };

    const handleAdminNotification = (data: {
      conversationId: string;
      type: string;
      title: string;
      message: string;
      createdAt: string;
    }) => {
      playSound();
      addNotification(data);
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations.all });
    };

    const handleStatusChanged = (data: {
      conversationId: string;
      status: ConversationStatus;
      assignedAdminId?: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.conversations.all });

      if (String(data.conversationId) === String(activeIdRef.current)) {
        setActiveConversationStatus(data.status);
      }
    };

    const handleTyping = (data: {
      conversationId: string;
      isTyping: boolean;
      sender?: MessageSender;
    }) => {
      if (
        data?.conversationId &&
        String(data.conversationId) !== String(activeIdRef.current)
      ) {
        return;
      }
      if (data.sender === MESSAGE_SENDER.AI) setAITyping(data.isTyping);
      else if (data.sender === MESSAGE_SENDER.CUSTOMER)
        setCustomerTyping(data.isTyping);
    };

    if (adminSocket.connected) handleConnect();
    adminSocket.on("connect", handleConnect);
    adminSocket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    adminSocket.on(SOCKET_EVENTS.WORKSPACE_NEW_MESSAGE, handleWorkspaceMessage);
    adminSocket.on(SOCKET_EVENTS.ADMIN_NOTIFICATION, handleAdminNotification);
    adminSocket.on(SOCKET_EVENTS.STATUS_CHANGED, handleStatusChanged);
    adminSocket.on(SOCKET_EVENTS.TYPING_STATUS, handleTyping);

    return () => {
      adminSocket.off("connect", handleConnect);
      adminSocket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      adminSocket.off(
        SOCKET_EVENTS.WORKSPACE_NEW_MESSAGE,
        handleWorkspaceMessage,
      );
      adminSocket.off(
        SOCKET_EVENTS.ADMIN_NOTIFICATION,
        handleAdminNotification,
      );
      adminSocket.off(SOCKET_EVENTS.STATUS_CHANGED, handleStatusChanged);
      adminSocket.off(SOCKET_EVENTS.TYPING_STATUS, handleTyping);
    };
  }, [
    queryClient,
    setAITyping,
    setCustomerTyping,
    setActiveConversationStatus,
    addNotification,
    playSound,
    workspaceId,
  ]);

  const emitAdminTyping = (isTyping: boolean) => {
    if (adminSocket.connected && activeConversationId) {
      adminSocket.emit(SOCKET_EVENTS.TYPING_STATUS, {
        conversationId: activeConversationId,
        isTyping,
        sender: MESSAGE_SENDER.ADMIN,
      });
    }
  };

  return { emitAdminTyping };
};
