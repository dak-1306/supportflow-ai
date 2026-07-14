import { create } from "zustand";

interface Message {
  _id: string;
  conversationId: string;
  sender: "CUSTOMER" | "AI" | "ADMIN";
  message: string;
  createdAt: string;
}

interface ChatState {
  activeConversationId: string | null;
  isCustomerTyping: boolean;
  realtimeMessages: Record<string, Message[]>; // Lưu tin nhắn realtime theo conversationId
  setActiveConversationId: (id: string | null) => void;
  setCustomerTyping: (isTyping: boolean) => void;
  addRealtimeMessage: (conversationId: string, message: Message) => void;
  clearRealtimeMessages: (conversationId: string) => void;
}

export const useAdminChatStore = create<ChatState>((set) => ({
  activeConversationId: null,
  isCustomerTyping: false,
  realtimeMessages: {},
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),
  setCustomerTyping: (isCustomerTyping) => set({ isCustomerTyping }),
  addRealtimeMessage: (conversationId, message) =>
    set((state) => {
      const currentList = state.realtimeMessages[conversationId] || [];
      // Tránh trùng lặp tin nhắn
      if (currentList.some((m) => m._id === message._id)) return state;
      return {
        realtimeMessages: {
          ...state.realtimeMessages,
          [conversationId]: [...currentList, message],
        },
      };
    }),
  clearRealtimeMessages: (conversationId) =>
    set((state) => ({
      realtimeMessages: {
        ...state.realtimeMessages,
        [conversationId]: [],
      },
    })),
}));
