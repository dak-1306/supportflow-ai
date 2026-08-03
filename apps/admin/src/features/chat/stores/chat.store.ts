import { create } from "zustand";
import { ConversationStatus } from "@supportflow/shared-types";

export interface INotificationItem {
  conversationId: string;
  type: string;
  title?: string;
  message?: string;
  createdAt?: string;
}

interface AdminChatState {
  activeConversationId: string | null;
  activeConversationStatus: ConversationStatus | null;
  isCustomerTyping: boolean;
  isAITyping: boolean;
  unreadNotificationCount: number;
  notifications: INotificationItem[];

  // Actions
  setActiveConversationId: (id: string | null) => void;
  setActiveConversationStatus: (status: ConversationStatus | null) => void;
  setCustomerTyping: (isTyping: boolean) => void;
  setAITyping: (isTyping: boolean) => void;
  addNotification: (item: INotificationItem) => void;
  clearUnreadNotifications: () => void;
}

export const useAdminChatStore = create<AdminChatState>((set) => ({
  activeConversationId: null,
  activeConversationStatus: null,
  isCustomerTyping: false,
  isAITyping: false,
  unreadNotificationCount: 0,
  notifications: [],

  // 🟢 Tự động reset indicator typing khi chọn conversation mới
  setActiveConversationId: (activeConversationId) =>
    set({
      activeConversationId,
      isCustomerTyping: false,
      isAITyping: false,
    }),

  setActiveConversationStatus: (activeConversationStatus) =>
    set({ activeConversationStatus }),

  setCustomerTyping: (isCustomerTyping) => set({ isCustomerTyping }),

  setAITyping: (isAITyping) => set({ isAITyping }),

  addNotification: (item) =>
    set((state) => ({
      unreadNotificationCount: state.unreadNotificationCount + 1,
      notifications: [item, ...state.notifications],
    })),

  clearUnreadNotifications: () => set({ unreadNotificationCount: 0 }),
}));
