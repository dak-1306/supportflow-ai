import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../store/chatStore";
import { widgetKeys } from "./useChatQueries";
import { MessagesResponse } from "../services/api";

export const useChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { conversationId, setAdminTyping } = useChatStore();

  useEffect(() => {
    if (!conversationId) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

    socketRef.current.emit("join_room", { conversationId });

    socketRef.current.on("new_message", (message) => {
      // Cập nhật realtime vào cache của React Query thay vì ghi trực tiếp vào Zustand
      queryClient.setQueryData(
        widgetKeys.messages(conversationId),
        (oldData: MessagesResponse | undefined) => {
          if (!oldData) return { messages: [message], total: 1 };

          const exists = oldData.messages.some((m) => m._id === message._id);
          if (exists) return oldData;

          return {
            messages: [...oldData.messages, message],
            total: oldData.total + 1,
          };
        },
      );
    });

    socketRef.current.on("typing_status", (data: { isTyping: boolean }) => {
      setAdminTyping(data.isTyping);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave_room", { conversationId });
        socketRef.current.disconnect();
      }
    };
  }, [conversationId, queryClient, setAdminTyping]);

  const emitTypingStatus = (isTyping: boolean) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("typing_status", { conversationId, isTyping });
    }
  };

  return { emitTypingStatus };
};
