import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "@/store/chatStore";
import { widgetKeys } from "@/hooks/useChatQueries";
import { MessagesResponse } from "@/services/chat.api";
import { IMessage } from "@supportflow/shared-types";
import { notificationSound } from "@supportflow/assets"; // Import âm thanh từ package assets

export const useChatSocket = (page = 1, limit = 50) => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { conversationId, setTypingStatus } = useChatStore();

  // EFFECT 1: Quản lý vòng đời kết nối Socket (Chỉ chạy lại khi conversationId thay đổi)
  useEffect(() => {
    if (!conversationId) return;

    // Ép transports là websocket để triệt tiêu loop polling lỗi
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
        autoConnect: true,
      },
    );

    socketRef.current = socket;

    const handleConnect = () => {
      console.log(
        "🔗 Widget Socket connected! Joining room...",
        conversationId,
      );
      socket.emit("join_room", { conversationId });
    };

    if (socket.connected) handleConnect();
    socket.on("connect", handleConnect);

    // Lắng nghe thực thể typing
    socket.on(
      "typing_status",
      (data: { isTyping: boolean; sender?: "ADMIN" | "AI" }) => {
        setTypingStatus(data.isTyping, data.sender);
      },
    );

    return () => {
      socket.emit("leave_room", { conversationId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conversationId, setTypingStatus]);

  // EFFECT 2: Đồng bộ nhận tin nhắn mới dựa trên biến page/limit cập nhật của React Query cache
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId) return;

    const handleNewMessage = (message: IMessage) => {
      // 1. Cập nhật Cache React Query
      queryClient.setQueryData(
        [widgetKeys.messages(conversationId), page, limit],
        (oldData: MessagesResponse | undefined) => {
          if (!oldData) return { messages: [message], total: 1 };
          if (oldData.messages.some((m) => m.id === message.id)) return oldData;

          return {
            ...oldData,
            messages: [...oldData.messages, message],
            total: oldData.total + 1,
          };
        },
      );

      // 🟢 2. XỬ LÝ THÔNG BÁO CHO WIDGET:
      // Lấy trạng thái isOpen hiện tại trực tiếp từ Zustand store
      const isWidgetOpen = useChatStore.getState().isOpen;

      // Nếu tin nhắn do ADMIN hoặc AI gửi tới VÀ Widget đang ĐÓNG
      if (message.sender !== "CUSTOMER" && !isWidgetOpen) {
        // Tăng số tin nhắn chưa đọc
        useChatStore.getState().incrementUnreadCount();

        // Phát âm thanh báo tin nhắn mới
        try {
          const audio = new Audio(notificationSound);
          audio.play().catch(() => {});
        } catch (e) {}
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [conversationId, page, limit, queryClient]);

  const emitTypingStatus = (isTyping: boolean) => {
    if (socketRef.current?.connected && conversationId) {
      socketRef.current.emit("typing_status", {
        conversationId,
        isTyping,
        sender: "CUSTOMER",
      });
    }
  };

  return { emitTypingStatus };
};
