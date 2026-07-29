import { create } from "zustand";
import { IMessage, ConversationStatus } from "@supportflow/shared-types";
import { AdminChatState } from "@/features/chat/types";

// 🟢 1. Dữ liệu một Item thông báo
export interface INotificationItem {
  conversationId: string;
  type: string;
  title?: string;
  message?: string;
  createdAt?: string;
}

// 🟢 2. Mở rộng State bao gồm cả Status và Notification
interface ExtendedAdminChatState extends AdminChatState {
  activeConversationStatus: ConversationStatus | null;
  unreadNotificationCount: number;
  notifications: INotificationItem[];
}

// 🟢 3. Các Actions cho Store (thêm actions quản lý thông báo)
interface ChatActions {
  setActiveConversationId: (id: string | null) => void;
  setActiveConversationStatus: (status: ConversationStatus | null) => void;
  setCustomerTyping: (isTyping: boolean) => void;
  setAITyping: (isTyping: boolean) => void;
  addRealtimeMessage: (conversationId: string, message: IMessage) => void;
  clearRealtimeMessages: (conversationId: string) => void;

  // 🟢 THÊM MỚI: Actions cho Notifications
  addNotification: (item: INotificationItem) => void;
  clearUnreadNotifications: () => void;
}

type ChatStore = ExtendedAdminChatState & ChatActions;

export const useAdminChatStore = create<ChatStore>((set) => ({
  // State mặc định
  activeConversationId: null,
  activeConversationStatus: null,
  isCustomerTyping: false,
  isAITyping: false,
  realtimeMessages: {},

  // 🟢 State mặc định cho Notifications
  unreadNotificationCount: 0,
  notifications: [],

  // Actions
  setActiveConversationId: (activeConversationId) =>
    set({ activeConversationId }),

  setActiveConversationStatus: (activeConversationStatus) =>
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

  // 🟢 THÊM MỚI: Thêm thông báo mới & tăng số lượng chưa đọc
  addNotification: (item) =>
    set((state) => ({
      unreadNotificationCount: state.unreadNotificationCount + 1,
      notifications: [item, ...state.notifications],
    })),

  // 🟢 THÊM MỚI: Reset số lượng chưa đọc về 0 khi Admin bấm mở chuông
  clearUnreadNotifications: () =>
    set({
      unreadNotificationCount: 0,
    }),
}));
