// hooks/useAdminChatSocket.ts
import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store"; // Import auth store lấy workspaceId
import { chatKeys } from "@/features/chat/hooks/useChatQueries";
import { IMessage, ConversationStatus } from "@supportflow/shared-types";

import { notificationSound } from "@supportflow/assets";

export const useAdminChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.user?.workspaceId);

  const processedMessageIds = new Set<string>();

  const {
    activeConversationId,
    setActiveConversationStatus,
    addRealtimeMessage,
    setCustomerTyping,
    setAITyping,
    addNotification, // Action từ Zustand
  } = useAdminChatStore();

  const activeIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

  // Hàm phát tiếng chuông
  const playSound = useCallback(() => {
    try {
      const audio = new Audio(notificationSound);
      audio.play().catch(() => {});
    } catch (e) {}
  }, []);

  useEffect(() => {
    const socket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
      {
        transports: ["websocket"],
        autoConnect: true,
      },
    );
    socketRef.current = socket;

    socket.on("connect", () => {
      // 🟢 1. Join Room Workspace để nhận thông báo khẩn từ AI
      if (workspaceId) {
        socket.emit("join_workspace", { workspaceId });
      }

      if (activeIdRef.current) {
        socket.emit("join_room", { conversationId: activeIdRef.current });
      }
    });

    socket.on(
      "new_message",
      (message: IMessage & { conversationStatus?: ConversationStatus }) => {
        // 🟢 1. CHỐNG LẶP TIN NHẮN (Deduplication)
        const msgId = message.id || (message as any)._id;
        if (msgId) {
          if (processedMessageIds.has(msgId)) return; // Nếu đã xử lý rồi -> Bỏ qua
          processedMessageIds.add(msgId);

          // Dọn dẹp cache memory sau 5 giây để tránh phình dung lượng
          setTimeout(() => processedMessageIds.delete(msgId), 5000);
        }

        // Cập nhật tin nhắn vào UI
        addRealtimeMessage(message.conversationId, message);
        queryClient.invalidateQueries({ queryKey: ["conversations"] });

        // 🟢 2. XỬ LÝ THÔNG BÁO CHO CUSTOMER
        if (message.sender === "CUSTOMER") {
          // Bỏ qua nếu status là AI
          if (message.conversationStatus === "AI") return;

          // Luôn phát chuông
          playSound();

          // Kiểm tra xem Admin có đang mở ĐÚNG đoạn chat này hay không
          const currentActiveId = activeIdRef.current
            ? String(activeIdRef.current)
            : null;
          const incomingConversationId = String(message.conversationId);

          // Nếu Admin KHÔNG ĐANG MỞ đúng đoạn chat này (hoặc đang ở trang khác)
          if (incomingConversationId !== currentActiveId) {
            addNotification({
              conversationId: incomingConversationId,
              type:
                message.conversationStatus === "WAITING_ADMIN"
                  ? "WAITING_HANDOFF"
                  : "CUSTOMER_MESSAGE",
              title:
                message.conversationStatus === "WAITING_ADMIN"
                  ? "Cần hỗ trợ gấp!"
                  : "Tin nhắn mới",
              message:
                message.message ||
                (message as any).content ||
                "Khách hàng đã gửi một tin nhắn.",
              createdAt: new Date().toISOString(),
            });
          }
        }
      },
    );

    // 🟢 2. Xử lý THÔNG BÁO ADMIN & Phát tiếng
    socket.on(
      "admin_notification",
      (data: {
        conversationId: string;
        type: string;
        title?: string;
        message?: string;
      }) => {
        if (data.type?.toUpperCase() === "WAITING_HANDOFF") {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });

          // Lưu vào Zustand Store & Phát âm thanh
          addNotification({
            conversationId: data.conversationId,
            type: data.type,
            title: data.title || "Cần hỗ trợ!",
            message: data.message || "Khách hàng cần tư vấn viên tiếp quản.",
            createdAt: new Date().toISOString(),
          });
          playSound();
        }
      },
    );

    socket.on(
      "conversation_status_changed",
      (data: { conversationId: string; status: ConversationStatus }) => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(data.conversationId),
        });

        if (data.conversationId === activeIdRef.current) {
          setActiveConversationStatus(data.status);
        }
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [
    workspaceId,
    queryClient,
    addRealtimeMessage,
    setActiveConversationStatus,
    addNotification,
    playSound,
  ]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;

    if (socket.connected) {
      socket.emit("join_room", { conversationId: activeConversationId });
    }

    socket.on(
      "typing_status",
      (data: { isTyping: boolean; sender?: string }) => {
        if (data.sender === "AI") {
          setAITyping(data.isTyping);
        } else if (data.sender === "CUSTOMER") {
          // 🟢 CHỈ bật Customer Typing khi nguồn gửi đúng là CUSTOMER
          setCustomerTyping(data.isTyping);
        }
      },
    );

    return () => {
      socket.emit("leave_room", { conversationId: activeConversationId });
      socket.off("typing_status");
    };
  }, [activeConversationId, setCustomerTyping, setAITyping]);

  const emitAdminTyping = (isTyping: boolean) => {
    if (socketRef.current?.connected && activeConversationId) {
      socketRef.current.emit("typing_status", {
        conversationId: activeConversationId,
        isTyping,
        sender: "ADMIN",
      });
    }
  };

  return { emitAdminTyping };
};
