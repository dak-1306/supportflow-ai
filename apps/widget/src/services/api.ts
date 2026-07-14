import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface Message {
  _id: string;
  conversationId: string;
  sender: "CUSTOMER" | "AI" | "ADMIN";
  message: string;
  type: "TEXT" | "SYSTEM";
  createdAt: string;
}

export interface MessagesResponse {
  messages: Message[];
  total: number;
}

export const chatApi = {
  initConversation: async (customerId: string | null) => {
    const response = await apiClient.post("/customer/conversations/init", {
      customerId,
      workspaceId: import.meta.env.VITE_WORKSPACE_ID,
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
  ): Promise<Message> => {
    const response = await apiClient.post(
      `/customer/conversations/${conversationId}/messages`,
      { message },
    );
    return response.data.data; // Trả về Message vừa tạo
  },
};
