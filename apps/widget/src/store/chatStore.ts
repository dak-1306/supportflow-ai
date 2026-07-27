// store/chatStore.ts
import { create } from "zustand";

interface ChatState {
  isOpen: boolean;
  customerId: string | null;
  conversationId: string | null;
  typingStatus: { isTyping: boolean; sender: "ADMIN" | "AI" | null };
  unreadCount: number; // 🟢 THÊM MỚI

  setIsOpen: (isOpen: boolean) => void;
  setChatSession: (customerId: string, conversationId: string) => void;
  setTypingStatus: (isTyping: boolean, sender?: "ADMIN" | "AI") => void;
  incrementUnreadCount: () => void; // 🟢 THÊM MỚI
  clearUnreadCount: () => void; // 🟢 THÊM MỚI
  clearSession: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  customerId: localStorage.getItem("sf_customer_id"),
  conversationId: localStorage.getItem("sf_conversation_id"),
  typingStatus: { isTyping: false, sender: null },
  unreadCount: 0, // 🟢 Mặc định = 0

  setIsOpen: (isOpen) =>
    set((state) => ({
      isOpen,
      // Khi mở khung chat lên thì tự động reset số tin chưa đọc về 0
      unreadCount: isOpen ? 0 : state.unreadCount,
    })),

  setChatSession: (customerId, conversationId) => {
    localStorage.setItem("sf_customer_id", customerId);
    localStorage.setItem("sf_conversation_id", conversationId);
    set({ customerId, conversationId });
  },

  setTypingStatus: (isTyping, sender) =>
    set({
      typingStatus: { isTyping, sender: isTyping ? sender || "AI" : null },
    }),

  // 🟢 Tăng số tin chưa đọc lên 1
  incrementUnreadCount: () =>
    set((state) => ({ unreadCount: state.unreadCount + 1 })),

  // 🟢 Reset về 0
  clearUnreadCount: () => set({ unreadCount: 0 }),

  clearSession: () => {
    localStorage.removeItem("sf_customer_id");
    localStorage.removeItem("sf_conversation_id");
    set({
      customerId: null,
      conversationId: null,
      typingStatus: { isTyping: false, sender: null },
      unreadCount: 0,
    });
  },
}));
