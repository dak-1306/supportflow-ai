import { create } from "zustand";
import { IMessage } from "@supportflow/shared-types";
import { AdminChatState } from "../types"; // Import từ file types bạn vừa tạo

// Kế thừa AdminChatState và định nghĩa thêm các Action thay đổi State
interface ChatActions {
  setActiveConversationId: (id: string | null) => void;
  setCustomerTyping: (isTyping: boolean) => void;
  setAITyping: (isTyping: boolean) => void;
  addRealtimeMessage: (conversationId: string, message: IMessage) => void;
  clearRealtimeMessages: (conversationId: string) => void;
}

type ChatStore = AdminChatState & ChatActions;

export const useAdminChatStore = create<ChatStore>((set) => ({
  // State mặc định (Thỏa mãn Interface AdminChatState)
  activeConversationId: null,
  isCustomerTyping: false,
  isAITyping: false,
  realtimeMessages: {},

  // Actions
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),

  setCustomerTyping: (isCustomerTyping) => set({ isCustomerTyping }),

  setAITyping: (isAITyping) => set({ isAITyping }),

  addRealtimeMessage: (conversationId, message) =>
    set((state) => {
      const currentList = state.realtimeMessages[conversationId] || [];
      // Tránh trùng lặp tin nhắn
      if (currentList.some((m) => m.id === message.id)) return state;
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
