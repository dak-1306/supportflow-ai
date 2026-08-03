import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, MessagesResponse } from "@/services/chat.api";
import { IMessage } from "@supportflow/shared-types";

export const widgetKeys = {
  messages: (conversationId: string | null) =>
    ["widget-messages", conversationId] as const,
};

// Hook nạp lịch sử chat
export const useWidgetMessagesQuery = (
  conversationId: string | null,
  page = 1,
  limit = 50,
) => {
  return useQuery({
    queryKey: widgetKeys.messages(conversationId),
    queryFn: () => chatApi.getMessages(conversationId!, page, limit),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
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
      // Cập nhật đúng Cache Key thống nhất
      queryClient.setQueryData(
        widgetKeys.messages(conversationId),
        (oldData: MessagesResponse | undefined) => {
          if (!oldData) return { messages: [newMessage], total: 1 };

          // Kiểm tra chống trùng theo ID chuẩn
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
