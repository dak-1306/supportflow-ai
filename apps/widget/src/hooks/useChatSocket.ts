import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useChatStore } from "../store/chatStore";
import { widgetKeys } from "./useChatQueries";
import { MessagesResponse } from "../services/api";
import { IMessage } from "@supportflow/shared-types";

// Thêm tham số page và limit vào hook (mặc định page = 1, limit = 50)
export const useChatSocket = (page = 1, limit = 50) => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const { conversationId, setAdminTyping } = useChatStore();

  useEffect(() => {
    if (!conversationId) return;

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL);

    socketRef.current.emit("join_room", { conversationId });

    socketRef.current.on("new_message", (message: IMessage) => {
      // Cập nhật realtime vào đúng cache có chứa [page, limit] của React Query
      queryClient.setQueryData(
        [widgetKeys.messages(conversationId), page, limit], // <--- SỬA Ở ĐÂY
        (oldData: MessagesResponse | undefined) => {
          if (!oldData) return { messages: [message], total: 1 };

          // Kiểm tra trùng lặp
          const exists = oldData.messages.some((m) => m.id === message.id);
          if (exists) return oldData;

          return {
            ...oldData,
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
  }, [conversationId, page, limit, queryClient, setAdminTyping]); // Thêm page, limit vào dependency array

  const emitTypingStatus = (isTyping: boolean) => {
    if (socketRef.current && conversationId) {
      socketRef.current.emit("typing_status", { conversationId, isTyping });
    }
  };

  return { emitTypingStatus };
};
