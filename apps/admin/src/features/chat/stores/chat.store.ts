import { create } from "zustand";
import { IMessage, ConversationStatus } from "@supportflow/shared-types";
import { AdminChatState } from "../types";

interface ExtendedAdminChatState extends AdminChatState {
  activeConversationStatus: ConversationStatus | null;
}

interface ChatActions {
  setActiveConversationId: (id: string | null) => void;
  setActiveConversationStatus: (status: ConversationStatus | null) => void; // 🟢 THÊM MỚI
  setCustomerTyping: (isTyping: boolean) => void;
  setAITyping: (isTyping: boolean) => void;
  addRealtimeMessage: (conversationId: string, message: IMessage) => void;
  clearRealtimeMessages: (conversationId: string) => void;
}

type ChatStore = ExtendedAdminChatState & ChatActions;

export const useAdminChatStore = create<ChatStore>((set) => ({
  // State mặc định
  activeConversationId: null,
  activeConversationStatus: null, // 🟢 THÊM MỚI
  isCustomerTyping: false,
  isAITyping: false,
  realtimeMessages: {},

  // Actions
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),

  setActiveConversationStatus: (activeConversationStatus) =>
    // 🟢 THÊM MỚI
    set({ activeConversationStatus }),

  setCustomerTyping: (isCustomerTyping) => set({ isCustomerTyping }),

  setAITyping: (isAITyping) => set({ isAITyping }),

  addRealtimeMessage: (conversationId, message) =>
    set((state) => {
      const currentList = state.realtimeMessages[conversationId] || [];
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
