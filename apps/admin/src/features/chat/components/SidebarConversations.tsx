import React from "react";
import { useAdminChatStore } from "../stores/chat.store";
import { useConversationsQuery } from "../hooks/useChatQueries";

export const SidebarConversations: React.FC = () => {
  const { activeConversationId, setActiveConversationId } = useAdminChatStore();
  const {
    data: conversationResponse = [],
    isLoading,
    error,
  } = useConversationsQuery("AI");

  const conversations = conversationResponse?.conversations || [];
  const total = conversationResponse?.total || 0;

  if (isLoading)
    return (
      <div className="w-80 border-r border-gray-200 p-4 text-sm text-gray-400">
        Đang tải danh sách...
      </div>
    );
  if (error)
    return (
      <div className="w-80 border-r border-gray-200 p-4 text-sm text-red-500">
        Lỗi tải dữ liệu.
      </div>
    );

  return (
    <div className="w-80 border-r border-gray-200 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-slate-800">
          Khách hàng trực tuyến
        </h2>
        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold">
          {total}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.map((chat: any) => (
          <button
            key={chat._id}
            onClick={() => setActiveConversationId(chat._id)}
            className={`w-full text-left p-3 rounded-xl transition-colors flex flex-col gap-1 ${
              activeConversationId === chat._id
                ? "bg-slate-900 text-white"
                : "hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className="font-semibold text-sm truncate">
              Khách hàng #{chat.customerId.slice(-6)}
            </span>
            {chat.lastMessage && (
              <p
                className={`text-xs truncate ${activeConversationId === chat._id ? "text-gray-300" : "text-gray-400"}`}
              >
                {chat.lastMessage}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
