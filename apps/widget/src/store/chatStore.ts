import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  customerId: string | null;
  conversationId: string | null;
  isAdminTyping: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setChatSession: (customerId: string, conversationId: string) => void;
  setAdminTyping: (isTyping: boolean) => void;
  clearSession: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  customerId: localStorage.getItem("sf_customer_id"),
  conversationId: localStorage.getItem("sf_conversation_id"),
  isAdminTyping: false,

  setIsOpen: (isOpen) => set({ isOpen }),

  setChatSession: (customerId, conversationId) => {
    localStorage.setItem("sf_customer_id", customerId);
    localStorage.setItem("sf_conversation_id", conversationId);
    set({ customerId, conversationId });
  },

  setAdminTyping: (isAdminTyping) => set({ isAdminTyping }),

  clearSession: () => {
    localStorage.removeItem("sf_customer_id");
    localStorage.removeItem("sf_conversation_id");
    set({
      customerId: null,
      conversationId: null,
      isAdminTyping: false,
    });
  },
}));
