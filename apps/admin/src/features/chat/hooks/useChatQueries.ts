import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminChatApi } from "@/features/chat/services/chat.api";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import { ConversationStatus } from "@supportflow/shared-types";

export const chatKeys = {
  allConversations: (status?: ConversationStatus) =>
    ["conversations", status] as const,
  messages: (conversationId: string | null) =>
    ["messages", conversationId] as const,
};

// Hook lấy danh sách cuộc hội thoại
export const useConversationsQuery = (
  status: ConversationStatus = "AI",
  page = 1,
  limit = 20,
) => {
  return useQuery({
    queryKey: chatKeys.allConversations(status),
    queryFn: () => adminChatApi.getConversations(status, page, limit),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

// Hook lấy lịch sử tin nhắn
export const useMessagesQuery = (
  conversationId: string | null,
  page = 1,
  limit = 50,
) => {
  return useQuery({
    queryKey: chatKeys.messages(conversationId),
    queryFn: () => adminChatApi.getMessages(conversationId!, page, limit),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });
};

// Hook gửi tin nhắn
export const useSendMessageMutation = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );

  return useMutation({
    mutationFn: (msg: string) => {
      if (!conversationId) throw new Error("No active conversation ID");
      return adminChatApi.sendMessage(conversationId, msg);
    },
    onSuccess: (newMessage) => {
      setActiveConversationStatus("HUMAN");

      // Cập nhật Cache tin nhắn chuẩn
      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (oldData: any) => {
          if (!oldData)
            return { messages: [newMessage], total: 1, status: "HUMAN" };

          // Kiểm tra tránh trùng lặp id
          const exists = (oldData.messages || []).some(
            (m: any) => m.id === newMessage.id,
          );
          if (exists) return oldData;

          return {
            ...oldData,
            status: "HUMAN",
            messages: [...(oldData.messages || []), newMessage],
            total: (oldData.total || 0) + 1,
          };
        },
      );

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Hook Tiếp quản hội thoại
export const useTakeOverMutation = () => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );

  return useMutation({
    mutationFn: (conversationId: string) =>
      adminChatApi.takeOverConversation(conversationId),
    onSuccess: (_, conversationId) => {
      setActiveConversationStatus("HUMAN");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
    },
  });
};

// Hook Hoàn thành hội thoại
export const useResolveMutation = () => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );
  const setActiveConversationId = useAdminChatStore(
    (state) => state.setActiveConversationId,
  );

  return useMutation({
    mutationFn: (conversationId: string) =>
      adminChatApi.resolveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      setActiveConversationStatus("AI");
      setActiveConversationId(null);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
    },
  });
};

// Hook Bật AI Bot
export const useEnableAIMutation = () => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );

  return useMutation({
    mutationFn: (conversationId: string) =>
      adminChatApi.enableAI(conversationId),
    onSuccess: (_, conversationId) => {
      setActiveConversationStatus("AI");
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(conversationId),
      });
    },
  });
};
