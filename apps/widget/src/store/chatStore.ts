import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  customerId: string | null;
  conversationId: string | null;
  typingStatus: { isTyping: boolean; sender: "ADMIN" | "AI" | null }; // Nâng cấp state này
  setIsOpen: (isOpen: boolean) => void;
  setChatSession: (customerId: string, conversationId: string) => void;
  setTypingStatus: (isTyping: boolean, sender?: "ADMIN" | "AI") => void; // Thay thế cho setAdminTyping
  clearSession: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  customerId: localStorage.getItem("sf_customer_id"),
  conversationId: localStorage.getItem("sf_conversation_id"),
  typingStatus: { isTyping: false, sender: null },

  setIsOpen: (isOpen) => set({ isOpen }),

  setChatSession: (customerId, conversationId) => {
    localStorage.setItem("sf_customer_id", customerId);
    localStorage.setItem("sf_conversation_id", conversationId);
    set({ customerId, conversationId });
  },

  setTypingStatus: (isTyping, sender) =>
    set({
      typingStatus: { isTyping, sender: isTyping ? sender || "AI" : null },
    }),

  clearSession: () => {
    localStorage.removeItem("sf_customer_id");
    localStorage.removeItem("sf_conversation_id");
    set({
      customerId: null,
      conversationId: null,
      typingStatus: { isTyping: false, sender: null },
    });
  },
}));
