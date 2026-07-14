import { SidebarConversations } from "../features/chat/components/SidebarConversations";
import { ChatWindow } from "../features/chat/components/ChatWindow";

export default function ChatPage() {
  return (
    <div className="w-screen h-screen flex bg-slate-100 overflow-hidden">
      {/* Bạn có thể nhúng Sidebar Menu chính của Admin ở đây nếu có */}
      <div className="flex-1 flex h-full">
        <SidebarConversations />
        <ChatWindow />
      </div>
    </div>
  );
}
