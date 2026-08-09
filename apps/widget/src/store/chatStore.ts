// store/chatStore.ts
import { create } from "zustand";
import { MESSAGE_SENDER, MessageSender } from "@supportflow/shared-types";

// Lọc lấy duy nhất ADMIN và AI từ MessageSender gốc
export type WidgetTypingSender = Extract<MessageSender, "ADMIN" | "AI">;

const CUSTOMER_ID_KEY = "sf_customer_id";
const CONVERSATION_ID_KEY = "sf_conversation_id";

interface ChatState {
  isOpen: boolean;
  customerId: string | null;
  conversationId: string | null;
  typingStatus: { isTyping: boolean; sender: WidgetTypingSender | null };
  unreadCount: number;

  setIsOpen: (isOpen: boolean) => void;
  setChatSession: (customerId: string, conversationId: string) => void;
  setTypingStatus: (isTyping: boolean, sender?: WidgetTypingSender) => void;
  incrementUnreadCount: () => void;
  clearUnreadCount: () => void;
  clearSession: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  customerId: localStorage.getItem(CUSTOMER_ID_KEY),
  conversationId: localStorage.getItem(CONVERSATION_ID_KEY),
  typingStatus: { isTyping: false, sender: null },
  unreadCount: 0,

  setIsOpen: (isOpen) =>
    set((state) => ({
      isOpen,
      unreadCount: isOpen ? 0 : state.unreadCount,
    })),

  setChatSession: (customerId, conversationId) => {
    localStorage.setItem(CUSTOMER_ID_KEY, customerId);
    localStorage.setItem(CONVERSATION_ID_KEY, conversationId);
    set({ customerId, conversationId });
  },

  setTypingStatus: (isTyping, sender) =>
    set({
      typingStatus: {
        isTyping,
        sender: isTyping ? sender || MESSAGE_SENDER.AI : null,
      },
    }),

  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  clearUnreadCount: () => set({ unreadCount: 0 }),

  clearSession: () => {
    localStorage.removeItem(CUSTOMER_ID_KEY);
    localStorage.removeItem(CONVERSATION_ID_KEY);
    set({
      customerId: null,
      conversationId: null,
      typingStatus: { isTyping: false, sender: null },
      unreadCount: 0,
    });
  },
}));
