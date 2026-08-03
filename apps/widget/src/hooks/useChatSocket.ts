import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/store/chatStore";
import { widgetKeys } from "@/hooks/useChatQueries";
import { IMessage } from "@supportflow/shared-types";
import { notificationSound } from "@supportflow/assets";
import { widgetSocket } from "@/utils/widgetSocket";

export const useChatSocket = () => {
  const queryClient = useQueryClient();
  const { conversationId, setTypingStatus } = useChatStore();
  const processedMessageIds = useRef(new Set<string>());

  // 🟢 1. XỬ LÝ JOIN / LEAVE ROOM KHI CONVERSATION_ID THAY ĐỔI
  useEffect(() => {
    if (!widgetSocket) return;

    const handleConnect = () => {
      console.log("🟢 Widget Socket connected! ID:", widgetSocket.id);
      if (conversationId) {
        console.log("🔗 Widget EMIT JOIN ROOM (ON CONNECT):", conversationId);
        widgetSocket.emit("join_room", { conversationId });
      }
    };

    // Nếu socket đã connected sẵn thì emit luôn
    if (widgetSocket.connected && conversationId) {
      console.log(
        "🔗 Widget EMIT JOIN ROOM (ALREADY CONNECTED):",
        conversationId,
      );
      widgetSocket.emit("join_room", { conversationId });
    }

    widgetSocket.on("connect", handleConnect);

    return () => {
      widgetSocket.off("connect", handleConnect);
      if (conversationId && widgetSocket.connected) {
        widgetSocket.emit("leave_room", { conversationId });
      }
    };
  }, [conversationId]);

  // 🟢 2. QUẢN LÝ EVENT LISTENERS DÙNG SINGLETON SOCKET
  useEffect(() => {
    if (!widgetSocket) return;

    const handleConnect = () => {
      console.log("🟢 Widget Socket connected! ID:", widgetSocket.id);
      if (conversationId) {
        widgetSocket.emit("join_room", { conversationId });
      }
    };

    const handleTyping = (data: {
      isTyping: boolean;
      sender?: "ADMIN" | "AI";
    }) => {
      setTypingStatus(data.isTyping, data.sender);
    };

    const handleNewMessage = (message: IMessage) => {
      console.log("📩 🔥 [WIDGET RECEIVED MESSAGE!]:", message);

      if (!conversationId) return;

      const convIdStr = String(conversationId);
      const msgId = message.id;

      // Chống trùng lặp tin nhắn
      if (msgId) {
        if (processedMessageIds.current.has(msgId)) return;
        processedMessageIds.current.add(msgId);
        setTimeout(() => processedMessageIds.current.delete(msgId), 5000);
      }

      // CẬP NHẬT TRỰC TIẾP VÀO REACT QUERY CACHE
      queryClient.setQueryData(
        widgetKeys.messages(convIdStr),
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
      if (message.sender !== "CUSTOMER" && !isWidgetOpen) {
        useChatStore.getState().incrementUnreadCount();
        try {
          const audio = new Audio(notificationSound);
          audio.play().catch(() => {});
        } catch (e) {}
      }
    };

    // Đăng ký Listener
    if (widgetSocket.connected) handleConnect();
    widgetSocket.on("connect", handleConnect);
    widgetSocket.on("typing_status", handleTyping);
    widgetSocket.on("new_message", handleNewMessage);

    // CLEANUP
    return () => {
      widgetSocket.off("connect", handleConnect);
      widgetSocket.off("typing_status", handleTyping);
      widgetSocket.off("new_message", handleNewMessage);
    };
  }, [conversationId, queryClient, setTypingStatus]);

  const emitTypingStatus = (isTyping: boolean) => {
    if (widgetSocket.connected && conversationId) {
      widgetSocket.emit("typing_status", {
        conversationId,
        isTyping,
        sender: "CUSTOMER",
      });
    }
  };

  return { emitTypingStatus };
};
