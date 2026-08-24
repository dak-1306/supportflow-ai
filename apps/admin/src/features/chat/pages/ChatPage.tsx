import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SidebarConversations } from "@/features/chat/components/SidebarConversations";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import { useAdminChatStore } from "@/features/chat/stores/chat.store";

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const conversationIdFromUrl = searchParams.get("id");

  const setActiveConversationId = useAdminChatStore(
    (s) => s.setActiveConversationId,
  );

  // Sync id từ URL vào Store khi nhấp từ Notification
  useEffect(() => {
    if (conversationIdFromUrl) {
      setActiveConversationId(conversationIdFromUrl);
    }
  }, [conversationIdFromUrl, setActiveConversationId]);

  // Reset state khi unmount
  useEffect(() => {
    return () => {
      setActiveConversationId(null);
    };
  }, [setActiveConversationId]);

  return (
    <div className="flex-1 w-full h-full min-h-0 flex bg-background overflow-hidden border border-border rounded-xl shadow-sm">
      <SidebarConversations />
      <ChatWindow />
    </div>
  );
}
