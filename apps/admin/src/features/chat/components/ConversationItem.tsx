import { memo } from "react";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import { IConversation } from "@/features/chat/types";

interface Props {
  chat: IConversation;
  isActive: boolean;
  onSelect: (chat: IConversation) => void;
}

const CONVERSATION_TEXT = {
  waitingAdminText: "⚠️ Cần Admin",
  humanText: "Admin Tiếp Quản",
  aiText: "AI Bot",
};

export const ConversationItem = memo(({ chat, isActive, onSelect }: Props) => {
  const formattedTime = new Date(chat.updatedAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <button
      onClick={() => onSelect(chat)}
      className={`w-full text-left p-3 rounded-lg transition-all duration-150 flex flex-col gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring relative ${
        isActive
          ? "bg-primary text-primary-foreground shadow-sm"
          : chat.status === "WAITING_ADMIN"
            ? "bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20"
            : "hover:bg-secondary/60 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <span className="font-medium text-sm truncate">
          User #{chat.customerId.slice(-6).toUpperCase()}
        </span>
        <span
          className={`text-[10px] font-mono ${isActive ? "text-primary-foreground/70" : "text-muted-foreground"}`}
        >
          {formattedTime}
        </span>
      </div>

      {chat.lastMessage && (
        <p
          className={`text-xs truncate w-full ${isActive ? "text-primary-foreground/80" : "text-muted-foreground"}`}
        >
          {chat.lastMessage}
        </p>
      )}

      <div className="flex gap-1 mt-0.5">
        {chat.status === "WAITING_ADMIN" && (
          <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0 rounded animate-bounce">
            {CONVERSATION_TEXT.waitingAdminText}
          </Badge>
        )}
        {chat.status === "HUMAN" && (
          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] px-1.5 py-0 rounded">
            {CONVERSATION_TEXT.humanText}
          </Badge>
        )}
        {chat.status === "AI" && (
          <Badge
            variant="outline"
            className={`text-[9px] px-1 py-0 uppercase font-medium ${
              isActive
                ? "border-primary-foreground text-primary-foreground"
                : "bg-purple-500/10 text-purple-500 border-purple-500/20"
            }`}
          >
            {CONVERSATION_TEXT.aiText}
          </Badge>
        )}
      </div>
    </button>
  );
});

ConversationItem.displayName = "ConversationItem";
