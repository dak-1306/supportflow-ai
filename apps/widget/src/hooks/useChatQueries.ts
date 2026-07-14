import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, MessagesResponse } from "../services/api";

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
    queryKey: [widgetKeys.messages(conversationId), page, limit],
    queryFn: () => chatApi.getMessages(conversationId!, page, limit),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Cache giữ trạng thái mới trong 5 phút
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
    onSuccess: (newMessage) => {
      // Cập nhật Optimistic trực tiếp vào Cache tin nhắn giúp hiển thị ngay lập tức
      queryClient.setQueryData(
        widgetKeys.messages(conversationId),
        (oldData: MessagesResponse | undefined) => {
          if (!oldData) return { messages: [newMessage], total: 1 };

          // Tránh trùng lặp tin nhắn nếu Socket cũng đồng thời nhận được tin nhắn này
          const exists = oldData.messages.some((m) => m._id === newMessage._id);
          if (exists) return oldData;

          return {
            messages: [...oldData.messages, newMessage],
            total: oldData.total + 1,
          };
        },
      );
    },
  });
};
