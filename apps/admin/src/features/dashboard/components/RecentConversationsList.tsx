import React from "react";
import {
  CONVERSATION_STATUS,
  ConversationStatus,
} from "@supportflow/shared-types";
import { RecentConversationItem } from "@/features/dashboard/types/types";

interface RecentConversationsListProps {
  conversations: RecentConversationItem[];
}

const renderStatusBadge = (status: ConversationStatus) => {
  switch (status) {
    case CONVERSATION_STATUS.AI:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">
          AI
        </span>
      );
    case CONVERSATION_STATUS.WAITING_ADMIN:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-700">
          Waiting
        </span>
      );
    case CONVERSATION_STATUS.HUMAN:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700">
          Human
        </span>
      );
    case CONVERSATION_STATUS.RESOLVED:
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
          Resolved
        </span>
      );
    default:
      return null;
  }
};

export const RecentConversationsList: React.FC<
  RecentConversationsListProps
> = ({ conversations }) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Cuộc trò chuyện gần đây
      </h2>
      <div className="space-y-3">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            Chưa có dữ liệu trò chuyện.
          </p>
        ) : (
          conversations.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-50"
            >
              <div className="truncate pr-2">
                <p className="text-sm font-medium text-gray-800 truncate">
                  Khách: {item.customerId}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(item.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              {renderStatusBadge(item.status)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
