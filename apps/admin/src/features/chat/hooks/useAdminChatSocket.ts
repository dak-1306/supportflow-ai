import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminChatStore } from "../stores/chat.store";
import { chatKeys } from "./useChatQueries";
import { IMessage } from "@supportflow/shared-types";
import { IConversation } from "../types";

export const useAdminChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const {
    activeConversationId,
    addRealtimeMessage,
    setCustomerTyping,
    setAITyping,
  } = useAdminChatStore();

  // EFFECT 1: Chỉ tạo duy nhất 1 connection socket tổng cho toàn trang Admin
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
      console.log(
        "🚀 Admin Socket connected successfully via WebSocket protocol!",
      );
      // Nếu đang mở dở một phòng chat trước khi rớt mạng, tự động join lại
      if (activeConversationId) {
        socket.emit("join_room", { conversationId: activeConversationId });
      }
    });

    socket.on("new_message", (message: IMessage) => {
      addRealtimeMessage(message.conversationId, message);

      const updateCache = (statusKey: string) => {
        queryClient.setQueryData(
          chatKeys.allConversations(statusKey),
          (
            oldData:
              { conversations: IConversation[]; total: number } | undefined,
          ) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              conversations: oldData.conversations.map((c) =>
                c.id === message.conversationId
                  ? {
                      ...c,
                      lastMessage: message.message,
                      updatedAt: new Date().toISOString(),
                    }
                  : c,
              ),
            };
          },
        );
      };

      updateCache("AI");
      updateCache("WAITING_ADMIN");
    });

    socket.on(
      "admin_notification",
      (data: { conversationId: string; type: string }) => {
        if (data.type === "waiting_handoff") {
          queryClient.invalidateQueries({
            queryKey: chatKeys.allConversations("AI"),
          });
          queryClient.invalidateQueries({
            queryKey: chatKeys.allConversations("WAITING_ADMIN"),
          });
        }
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, addRealtimeMessage]); // Không đưa activeConversationId vào đây để tránh reconnect socket bừa bãi

  // EFFECT 2: Chỉ lo việc Join/Leave room khi Admin đổi phòng chat
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeConversationId) return;

    // Nếu socket đã kết nối sẵn thì join ngay, ngược lại sự kiện 'connect' ở Effect 1 sẽ lo
    if (socket.connected) {
      socket.emit("join_room", { conversationId: activeConversationId });
    }

    socket.on(
      "typing_status",
      (data: { isTyping: boolean; sender?: string }) => {
        if (data.sender === "AI") {
          setAITyping(data.isTyping);
        } else {
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
