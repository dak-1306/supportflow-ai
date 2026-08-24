import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminChatApi } from "@/features/chat/services/chat.api";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";
import {
  CONVERSATION_STATUS,
  ConversationStatus,
  IMessage,
} from "@supportflow/shared-types";

export const chatKeys = {
  conversations: {
    all: ["conversations"] as const,
    list: (status?: ConversationStatus, page = 1, limit = 20) =>
      ["conversations", { status, page, limit }] as const,
  },
  messages: {
    all: ["messages"] as const,
    byConversation: (conversationId: string | null) =>
      ["messages", conversationId] as const,
    list: (conversationId: string | null, page = 1, limit = 50) =>
      ["messages", conversationId, { page, limit }] as const,
  },
};

interface MessagesData {
  messages: IMessage[];
  total: number;
  status?: ConversationStatus;
}

export const useConversationsQuery = (
  status: ConversationStatus = CONVERSATION_STATUS.AI,
  page = 1,
  limit = 20,
) => {
  return useQuery({
    queryKey: chatKeys.conversations.list(status, page, limit),
    queryFn: () => adminChatApi.getConversations(status, page, limit),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
};

export const useMessagesQuery = (
  conversationId: string | null,
  page = 1,
  limit = 50,
) => {
  return useQuery({
    queryKey: chatKeys.messages.list(conversationId, page, limit),
    queryFn: () => adminChatApi.getMessages(conversationId!, page, limit),
    enabled: !!conversationId,
    refetchOnWindowFocus: false,
  });
};

export const useSendMessageMutation = (conversationId: string | null) => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );

  return useMutation({
    mutationFn: (msg: string) => {
      if (!conversationId) throw new Error("No active conversation ID");
      return adminChatApi.sendMessage(conversationId, msg);
    },
    onSuccess: (newMessage: IMessage) => {
      setActiveConversationStatus(CONVERSATION_STATUS.HUMAN);

      queryClient.setQueriesData<MessagesData>(
        { queryKey: chatKeys.messages.list(conversationId, 1) },
        (oldData) => {
          if (!oldData) {
            return {
              messages: [newMessage],
              total: 1,
              status: CONVERSATION_STATUS.HUMAN,
            };
          }

          const exists = oldData.messages.some((m) => m.id === newMessage.id);
          if (exists) return oldData;

          return {
            ...oldData,
            status: CONVERSATION_STATUS.HUMAN,
            messages: [...oldData.messages, newMessage],
            total: oldData.total + 1,
          };
        },
      );

      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all,
      });
    },
  });
};

export const useTakeOverMutation = () => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );

  return useMutation({
    mutationFn: (conversationId: string) =>
      adminChatApi.takeOverConversation(conversationId),
    onSuccess: (_, conversationId) => {
      setActiveConversationStatus(CONVERSATION_STATUS.HUMAN);
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all,
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages.byConversation(conversationId),
      });
    },
  });
};

export const useResolveMutation = () => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );
  const setActiveConversationId = useAdminChatStore(
    (state) => state.setActiveConversationId,
  );

  return useMutation({
    mutationFn: (conversationId: string) =>
      adminChatApi.resolveConversation(conversationId),
    onSuccess: (_, conversationId) => {
      setActiveConversationStatus(CONVERSATION_STATUS.RESOLVED);
      setActiveConversationId(null);
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all,
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages.byConversation(conversationId),
      });
    },
  });
};

export const useEnableAIMutation = () => {
  const queryClient = useQueryClient();
  const setActiveConversationStatus = useAdminChatStore(
    (state) => state.setActiveConversationStatus,
  );

  return useMutation({
    mutationFn: (conversationId: string) =>
      adminChatApi.enableAI(conversationId),
    onSuccess: (_, conversationId) => {
      setActiveConversationStatus(CONVERSATION_STATUS.AI);
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations.all,
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages.byConversation(conversationId),
      });
    },
  });
};
