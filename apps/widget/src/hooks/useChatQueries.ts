import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, MessagesResponse } from "@/services/chat.api";
import { IMessage } from "@supportflow/shared-types";

// 🟢 1. QUERY KEY FACTORY CHUẨN XÁC VỚI PHÂN TRANG
export const widgetKeys = {
  messages: {
    all: ["widget-messages"] as const,
    byConversation: (conversationId: string | null) =>
      ["widget-messages", conversationId] as const,
    list: (conversationId: string | null, page = 1, limit = 50) =>
      ["widget-messages", conversationId, { page, limit }] as const,
  },
};

// Hook nạp lịch sử chat
export const useWidgetMessagesQuery = (
  conversationId: string | null,
  page = 1,
  limit = 50,
) => {
  return useQuery({
    queryKey: widgetKeys.messages.list(conversationId, page, limit),
    queryFn: () => chatApi.getMessages(conversationId!, page, limit),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // 5 phút
  });
};

// Hook gửi tin nhắn
export const useWidgetSendMessageMutation = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => {
      if (!conversationId) throw new Error("No active session");
      return chatApi.sendMessage(conversationId, message);
    },
    onSuccess: (newMessage: IMessage) => {
      // 🟢 Cập nhật tất cả Query liên quan đến conversationId này
      queryClient.setQueriesData(
        { queryKey: widgetKeys.messages.byConversation(conversationId) },
        (oldData: MessagesResponse | undefined) => {
          if (!oldData) return { messages: [newMessage], total: 1 };

          // Chống trùng lặp tin nhắn
          const exists = oldData.messages.some((m) => m.id === newMessage.id);
          if (exists) return oldData;

          return {
            ...oldData,
            messages: [...oldData.messages, newMessage],
            total: oldData.total + 1,
          };
        },
      );
    },
  });
};
