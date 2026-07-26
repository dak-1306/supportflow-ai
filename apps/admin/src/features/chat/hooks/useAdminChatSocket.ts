import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminChatStore } from "../stores/chat.store";
import { chatKeys } from "./useChatQueries";
import { IMessage, ConversationStatus } from "@supportflow/shared-types";

export const useAdminChatSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const {
    activeConversationId,
    setActiveConversationStatus,
    addRealtimeMessage,
    setCustomerTyping,
    setAITyping,
  } = useAdminChatStore();

  // 🟢 Dùng Ref để luôn truy cập được activeConversationId MỚI NHẤT trong socket callback
  const activeIdRef = useRef(activeConversationId);
  useEffect(() => {
    activeIdRef.current = activeConversationId;
  }, [activeConversationId]);

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
      if (activeIdRef.current) {
        socket.emit("join_room", { conversationId: activeIdRef.current });
      }
    });

    socket.on("new_message", (message: IMessage) => {
      addRealtimeMessage(message.conversationId, message);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    });

    socket.on(
      "admin_notification",
      (data: { conversationId: string; type: string }) => {
        if (data.type?.toUpperCase() === "WAITING_HANDOFF") {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
        }
      },
    );

    // 🟢 SỰ KIỆN ĐỔI STATUS: Luôn lấy ID chuẩn từ activeIdRef
    socket.on(
      "conversation_status_changed",
      (data: { conversationId: string; status: ConversationStatus }) => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(data.conversationId),
        });

        // So sánh chính xác không lo bị stale closure
        if (data.conversationId === activeIdRef.current) {
          setActiveConversationStatus(data.status);
        }
      },
    );

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient, addRealtimeMessage, setActiveConversationStatus]);

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
