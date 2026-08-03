import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import { useAuthStore } from "@/stores/auth.store";
import { IMessage, ConversationStatus } from "@supportflow/shared-types";
import { notificationSound } from "@supportflow/assets";
import { adminSocket } from "@/features/chat/libs/adminSocket";

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

  // 🟢 1. JOIN/LEAVE ROOM SẠCH SẼ
  useEffect(() => {
    if (!adminSocket) return;

    if (workspaceId) {
      adminSocket.emit("join_workspace", { workspaceId });
    }

    if (activeConversationId) {
      console.log("🚀 Admin EMIT JOIN ROOM:", activeConversationId);
      adminSocket.emit("join_room", { conversationId: activeConversationId });
    }

    return () => {
      if (activeConversationId) {
        console.log("🚪 Admin LEAVE ROOM:", activeConversationId);
        adminSocket.emit("leave_room", {
          conversationId: activeConversationId,
        });
      }
    };
  }, [activeConversationId, workspaceId]);

  // 🟢 2. KHỞI TẠO TẤT CẢ LISTENERS
  useEffect(() => {
    const handleConnect = () => {
      console.log("🟢 Socket Admin Connected! ID:", adminSocket.id);
      if (workspaceId) adminSocket.emit("join_workspace", { workspaceId });
      if (activeIdRef.current) {
        adminSocket.emit("join_room", { conversationId: activeIdRef.current });
      }
    };

    // 📩 Tin nhắn mới trong Room đang mở
    const handleNewMessage = (
      rawMessage: IMessage & { conversationStatus?: ConversationStatus },
    ) => {
      console.log("📩 🔥 [SOCKET RECEIVED ROOM MESSAGE]:", rawMessage);
      const msgId = rawMessage.id || (rawMessage as any)._id;

      if (msgId) {
        if (processedMessageIds.current.has(msgId)) return;
        processedMessageIds.current.add(msgId);
        setTimeout(() => processedMessageIds.current.delete(msgId), 5000);
      }

      const convIdStr = String(rawMessage.conversationId);

      queryClient.setQueriesData(
        { queryKey: ["messages", convIdStr] },
        (oldData: any) => {
          if (!oldData) return { messages: [rawMessage], total: 1 };
          const existing = oldData.messages || [];

          if (existing.some((m: any) => (m.id || m._id) === msgId)) {
            return oldData;
          }

          return {
            ...oldData,
            messages: [...existing, rawMessage],
            total: (oldData.total || 0) + 1,
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      if (
        rawMessage.sender === "CUSTOMER" &&
        rawMessage.conversationStatus !== "AI"
      ) {
        playSound();
      }
    };

    // 📬 Tin nhắn từ Workspace Sidebar
    const handleWorkspaceMessage = (
      rawMessage: IMessage & { conversationStatus?: ConversationStatus },
    ) => {
      const convIdStr = String(rawMessage.conversationId);
      const currentActiveId = activeIdRef.current
        ? String(activeIdRef.current)
        : null;

      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      if (
        rawMessage.sender === "CUSTOMER" &&
        rawMessage.conversationStatus !== "AI" &&
        convIdStr !== currentActiveId
      ) {
        playSound();
        addNotification({
          conversationId: convIdStr,
          type:
            rawMessage.conversationStatus === "WAITING_ADMIN"
              ? "WAITING_HANDOFF"
              : "CUSTOMER_MESSAGE",
          title:
            rawMessage.conversationStatus === "WAITING_ADMIN"
              ? "Cần hỗ trợ gấp!"
              : "Tin nhắn mới",
          message: rawMessage.message || "Khách hàng đã gửi một tin nhắn.",
          createdAt: new Date().toISOString(),
        });
      }
    };

    // 🔔 Thông báo khẩn từ AI (RAG Handoff)
    const handleAdminNotification = (data: {
      conversationId: string;
      type: string;
      title: string;
      message: string;
      createdAt: string;
    }) => {
      playSound();
      addNotification(data);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    };

    // 🔄 Thay đổi Trạng thái Cuộc hội thoại
    const handleStatusChanged = (data: {
      conversationId: string;
      status: ConversationStatus;
      assignedAdminId?: string;
    }) => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Nếu là phòng đang mở -> Sync trạng thái Store
      if (String(data.conversationId) === String(activeIdRef.current)) {
        setActiveConversationStatus(data.status);
      }
    };

    // ✍️ Kiểm tra Typing Indicator (Có lọc phòng)
    const handleTyping = (data: {
      conversationId: string;
      isTyping: boolean;
      sender?: string;
    }) => {
      // Chỉ cập nhật nếu event thuộc về phòng đang active
      if (
        data?.conversationId &&
        String(data.conversationId) !== String(activeIdRef.current)
      ) {
        return;
      }
      if (data.sender === "AI") setAITyping(data.isTyping);
      else if (data.sender === "CUSTOMER") setCustomerTyping(data.isTyping);
    };

    // Đăng ký Event
    if (adminSocket.connected) handleConnect();
    adminSocket.on("connect", handleConnect);
    adminSocket.on("new_message", handleNewMessage);
    adminSocket.on("workspace_new_message", handleWorkspaceMessage);
    adminSocket.on("admin_notification", handleAdminNotification);
    adminSocket.on("conversation_status_changed", handleStatusChanged);
    adminSocket.on("typing_status", handleTyping);

    return () => {
      adminSocket.off("connect", handleConnect);
      adminSocket.off("new_message", handleNewMessage);
      adminSocket.off("workspace_new_message", handleWorkspaceMessage);
      adminSocket.off("admin_notification", handleAdminNotification);
      adminSocket.off("conversation_status_changed", handleStatusChanged);
      adminSocket.off("typing_status", handleTyping);
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
      adminSocket.emit("typing_status", {
        conversationId: activeConversationId,
        isTyping,
        sender: "ADMIN",
      });
    }
  };

  return { emitAdminTyping };
};
