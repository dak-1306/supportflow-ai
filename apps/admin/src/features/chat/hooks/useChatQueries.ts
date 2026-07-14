import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminChatApi } from "../services/chat.api";

// Quản lý tập trung Cache Keys để tránh gõ sai
export const chatKeys = {
  allConversations: (status: string) => ["conversations", status] as const,
  messages: (conversationId: string | null) =>
    ["messages", conversationId] as const,
};

// Hook lấy danh sách cuộc hội thoại
export const useConversationsQuery = (status = "AI", page = 1, limit = 20) => {
  return useQuery({
    queryKey: chatKeys.allConversations(status),
    queryFn: () => adminChatApi.getConversations(status, page, limit),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5, // Dữ liệu được coi là mới trong 5 phút
  });
};

// Hook lấy lịch sử tin nhắn của cuộc hội thoại đang active
export const useMessagesQuery = (
  conversationId: string | null,
  page = 1,
  limit = 50,
) => {
  return useQuery({
    queryKey: [chatKeys.messages(conversationId), page, limit],
    queryFn: () => adminChatApi.getMessages(conversationId!, page, limit),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });
};

// Hook thực hiện gửi tin nhắn lên Server
export const useSendMessageMutation = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (msg: string) => {
      if (!conversationId) throw new Error("No active conversation ID");
      return adminChatApi.sendMessage(conversationId, msg);
    },
    onSuccess: (newMessage) => {
      // Vì Query Data hiện tại cấu trúc là { messages: [...], total: X }
      // Chúng ta cập nhật thêm tin nhắn mới vào danh sách và tăng total lên 1
      queryClient.setQueryData(
        chatKeys.messages(conversationId),
        (oldData: any) => {
          if (!oldData) return { messages: [newMessage], total: 1 };
          return {
            messages: [...(oldData.messages || []), newMessage],
            total: (oldData.total || 0) + 1,
          };
        },
      );
    },
  });
};
