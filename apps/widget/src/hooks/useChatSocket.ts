import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/store/chatStore";
import { widgetKeys } from "@/hooks/useChatQueries";
import {
  IMessage,
  SOCKET_EVENTS,
  MESSAGE_SENDER,
  MessageSender,
} from "@supportflow/shared-types";
import { notificationSound } from "@supportflow/assets";
import { widgetSocket } from "@/utils/widgetSocket";

export const useChatSocket = () => {
  const queryClient = useQueryClient();
  const { conversationId, setTypingStatus } = useChatStore();
  const processedMessageIds = useRef(new Set<string>());

  // 🟢 1. QUẢN LÝ JOIN / LEAVE ROOM KHI CONVERSATION_ID HOẶC SOCKET THAY ĐỔI
  useEffect(() => {
    if (!widgetSocket) return;

    const handleConnect = () => {
      if (conversationId) {
        widgetSocket.emit(SOCKET_EVENTS.JOIN_ROOM, { conversationId });
      }
    };

    if (widgetSocket.connected && conversationId) {
      widgetSocket.emit(SOCKET_EVENTS.JOIN_ROOM, { conversationId });
    }

    widgetSocket.on("connect", handleConnect);

    return () => {
      widgetSocket.off("connect", handleConnect);
      if (conversationId && widgetSocket.connected) {
        widgetSocket.emit(SOCKET_EVENTS.LEAVE_ROOM, { conversationId });
      }
    };
  }, [conversationId]);

  // 🟢 2. QUẢN LÝ EVENT LISTENERS NHẬN DỮ LIỆU
  useEffect(() => {
    if (!widgetSocket) return;

    const handleTyping = (data: {
      isTyping: boolean;
      sender?: MessageSender;
    }) => {
      if (
        data.sender === MESSAGE_SENDER.ADMIN ||
        data.sender === MESSAGE_SENDER.AI
      ) {
        setTypingStatus(data.isTyping, data.sender);
      }
    };

    const handleNewMessage = (message: IMessage) => {
      if (!conversationId) return;

      const convIdStr = String(conversationId);
      const msgId = message.id;

      // Chống trùng lặp tin nhắn
      if (msgId) {
        if (processedMessageIds.current.has(msgId)) return;
        processedMessageIds.current.add(msgId);
        setTimeout(() => processedMessageIds.current.delete(msgId), 5000);
      }

      // 🟢 Đã sửa: Bọc queryKey vào object { queryKey }
      queryClient.setQueriesData(
        { queryKey: widgetKeys.messages.byConversation(convIdStr) },
        (oldData: any) => {
          if (!oldData) return { messages: [message], total: 1 };

          const existingMessages = oldData.messages || [];
          if (existingMessages.some((m: IMessage) => m.id === msgId)) {
            return oldData;
          }

          return {
            ...oldData,
            messages: [...existingMessages, message],
            total: (oldData.total || 0) + 1,
          };
        },
      );

      // Xử lý thông báo & phát tiếng khi Widget đóng
      const isWidgetOpen = useChatStore.getState().isOpen;
      if (message.sender !== MESSAGE_SENDER.CUSTOMER && !isWidgetOpen) {
        useChatStore.getState().incrementUnreadCount();
        try {
          const audio = new Audio(notificationSound);
          audio.play().catch(() => {});
        } catch (e) {}
      }
    };

    // Đăng ký Event
    widgetSocket.on(SOCKET_EVENTS.TYPING_STATUS, handleTyping);
    widgetSocket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);

    // CLEANUP
    return () => {
      widgetSocket.off(SOCKET_EVENTS.TYPING_STATUS, handleTyping);
      widgetSocket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    };
  }, [conversationId, queryClient, setTypingStatus]);

  const emitTypingStatus = (isTyping: boolean) => {
    if (widgetSocket.connected && conversationId) {
      widgetSocket.emit(SOCKET_EVENTS.TYPING_STATUS, {
        conversationId,
        isTyping,
        sender: MESSAGE_SENDER.CUSTOMER,
      });
    }
  };

  return { emitTypingStatus };
};
