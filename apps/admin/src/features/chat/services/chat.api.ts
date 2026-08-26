import { api } from "@/shared/services/client";
import {
  CONVERSATION_STATUS,
  ConversationStatus,
} from "@supportflow/shared-types";

export const adminChatApi = {
  getConversations: async (
    status: ConversationStatus = CONVERSATION_STATUS.AI,
    page = 1,
    limit = 20,
  ) => {
    const response = await api.get(
      `/admin/conversations?status=${status}&page=${page}&limit=${limit}`,
    );
    return response;
  },

  getMessages: async (conversationId: string, page = 1, limit = 50) => {
    const response = await api.get(
      `/admin/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
    );
    return response;
  },

  sendMessage: async (conversationId: string, message: string) => {
    const response = await api.post(
      `/admin/conversations/${conversationId}/messages`,
      { message },
    );
    return response;
  },

  takeOverConversation: async (conversationId: string) => {
    const response = await api.patch(
      `/admin/conversations/${conversationId}/take-over`,
    );
    return response;
  },

  resolveConversation: async (conversationId: string) => {
    const response = await api.patch(
      `/admin/conversations/${conversationId}/resolve`,
    );
    return response;
  },

  enableAI: async (conversationId: string) => {
    const response = await api.patch(
      `/admin/conversations/${conversationId}/enable-ai`,
    );
    return response;
  },
};
