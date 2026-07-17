import { SidebarConversations } from "../features/chat/components/SidebarConversations";
import { ChatWindow } from "../features/chat/components/ChatWindow";

export default function ChatPage() {
  return (
    // Đảm bảo chiếm trọn không gian khả dụng và triệt tiêu scroll tổng của trang
    <div className="flex-1 w-full h-full min-h-0 flex bg-background overflow-hidden border border-border rounded-xl shadow-sm">
      <SidebarConversations />
      <ChatWindow />
    </div>
  );
}
