import { apiClient } from "@/services/api";
import { getWorkspaceId } from "@/utils/config";
import { IMessage } from "@supportflow/shared-types";
export interface MessagesResponse {
  messages: IMessage[];
  total: number;
}

export const chatApi = {
  initConversation: async (customerId: string | null) => {
    const workspaceId = getWorkspaceId();
    
    const response = await apiClient.post("/customer/conversations/init", {
      customerId,
      workspaceId,
    });
    return response.data.data; // Trả về { conversation, isNew, customerId }
  },

  getMessages: async (
    conversationId: string,
    page = 1,
    limit = 50,
  ): Promise<MessagesResponse> => {
    const response = await apiClient.get(
      `/customer/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      },
    );
    return response.data.data; // Trả về { messages: Message[], total: number }
  },

  sendMessage: async (
    conversationId: string,
    message: string,
  ): Promise<IMessage> => {
    const response = await apiClient.post(
      `/customer/conversations/${conversationId}/messages`,
      { message },
    );
    return response.data.data; // Trả về Message vừa tạo
  },
};
