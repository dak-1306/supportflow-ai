import { memo } from "react";
import ReactMarkdown from "react-markdown";
import { IMessage } from "@supportflow/shared-types";

interface Props {
  msg: IMessage;
}

export const ChatMessageItem = memo(({ msg }: Props) => {
  const isAdmin = msg.sender === "ADMIN";
  const isAI = msg.sender === "AI";
  const msgTime = new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex flex-col gap-1 max-w-[75%] ${
        isAdmin ? "ml-auto items-end" : "mr-auto items-start"
      }`}
    >
      <div
        className={`px-4 py-2.5 text-sm rounded-xl shadow-sm leading-relaxed ${
          isAdmin
            ? "bg-primary text-primary-foreground rounded-tr-none"
            : isAI
              ? "bg-purple-500/10 text-purple-700 border border-purple-200 rounded-tl-none font-medium"
              : "bg-card text-foreground border border-border rounded-tl-none"
        }`}
      >
        {isAI && (
          <span className="text-[10px] block text-purple-500 uppercase font-bold tracking-wider mb-1">
            AI Assistant
          </span>
        )}
        <div className="space-y-1.5 [&>p]:m-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>h3]:font-bold [&>h3]:text-sm [&>h3]:mt-1">
          <ReactMarkdown>{msg.message}</ReactMarkdown>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground/60 px-1">
        {msgTime} {isAI && "• Trợ lý AI"} {isAdmin && "• Admin"}
      </span>
    </div>
  );
});

ChatMessageItem.displayName = "ChatMessageItem";
