import { api } from "@/services/client";

export const adminChatApi = {
  getConversations: async (status = "OPEN", page = 1, limit = 20) => {
    const response = await api.get(
      `/admin/conversations?status=${status}&page=${page}&limit=${limit}`,
    );
    return response.data.data;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    const response = await api.get(
      `/admin/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    );
    return response.data.data;
  },

  sendMessage: async (conversationId: string, message: string) => {
    const response = await api.post(
      `/admin/conversations/${conversationId}/messages`,
      {
        message,
      },
    );
    return response.data.data;
  },

  takeOverConversation: async (conversationId: string) => {
    const response = await api.patch(
      `/admin/conversations/${conversationId}/take-over`,
    );
    return response.data.data;
  },

  resolveConversation: async (conversationId: string) => {
    const response = await api.patch(
      `/admin/conversations/${conversationId}/resolve`,
    );
    return response.data.data;
  },
  enableAI: async (conversationId: string) => {
    const response = await api.patch(
      `/admin/conversations/${conversationId}/enable-ai`,
    );
    return response.data.data;
  },
};
