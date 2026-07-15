import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminChatStore } from "../stores/chat.store";
import { chatKeys } from "./useChatQueries";
import { IMessage } from "@supportflow/shared-types";
import { IConversation } from "../types"; // Import đúng type Conversation của Admin

export const useAdminChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { activeConversationId, addRealtimeMessage, setCustomerTyping } =
    useAdminChatStore();

  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:5000",
    );

    socketRef.current.on("new_message", (message: IMessage) => {
      addRealtimeMessage(message.conversationId, message);

      // Cập nhật tin nhắn cuối cùng ngoài Sidebar bằng Cache Key đồng bộ
      queryClient.setQueryData(
        chatKeys.allConversations("AI"),
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
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [queryClient, addRealtimeMessage]);

  useEffect(() => {
    if (!socketRef.current || !activeConversationId) return;

    socketRef.current.emit("join_room", {
      conversationId: activeConversationId,
    });

    socketRef.current.on("typing_status", (data: { isTyping: boolean }) => {
      setCustomerTyping(data.isTyping);
    });

    return () => {
      if (socketRef.current && activeConversationId) {
        socketRef.current.emit("leave_room", {
          conversationId: activeConversationId,
        });
        socketRef.current.off("typing_status");
      }
    };
  }, [activeConversationId, setCustomerTyping]);

  const emitAdminTyping = (isTyping: boolean) => {
    if (socketRef.current && activeConversationId) {
      socketRef.current.emit("typing_status", {
        conversationId: activeConversationId,
        isTyping,
      });
    }
  };

  return { emitAdminTyping };
};
