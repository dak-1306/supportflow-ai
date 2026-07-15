import { SidebarConversations } from "../features/chat/components/SidebarConversations";
import { ChatWindow } from "../features/chat/components/ChatWindow";

export default function ChatPage() {
  return (
    // Đảm bảo chiếm trọn không gian khả dụng và triệt tiêu scroll tổng của trang
    <div className="w-full h-[calc(100vh-8rem)] flex bg-background overflow-hidden border border-border rounded-xl shadow-sm">
      <div className="flex-1 flex h-full overflow-hidden">
        <SidebarConversations />
        <ChatWindow />
      </div>
    </div>
  );
}
