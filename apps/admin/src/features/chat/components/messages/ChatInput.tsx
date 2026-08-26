import React, { useState, useRef } from "react";
import { Send } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Input } from "@supportflow/ui/src/components/ui/input";
import { ConversationStatus } from "@supportflow/shared-types";

interface Props {
  conversationStatus: ConversationStatus | string;
  isSending: boolean;
  onSend: (text: string) => void;
  onAdminTyping: (isTyping: boolean) => void;
}

const CHAT_INPUT_TEXT = {
  placeholder: {
    waitingAdmin: "Bấm 'Tiếp Quản Ngay' hoặc gõ tin nhắn để trả lời khách...",
    active: "Nhập phản hồi trực tiếp tới khách hàng...",
  },
};

export const ChatInput: React.FC<Props> = ({
  conversationStatus,
  isSending,
  onSend,
  onAdminTyping,
}) => {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onAdminTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onAdminTyping(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;
    onSend(text.trim());
    setText("");
    onAdminTyping(false);
  };

  return (
    <div className="p-4 bg-card border-t border-border shrink-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 max-w-5xl mx-auto"
      >
        <Input
          type="text"
          value={text}
          onChange={handleInputChange}
          placeholder={
            conversationStatus === "WAITING_ADMIN"
              ? CHAT_INPUT_TEXT.placeholder.waitingAdmin
              : CHAT_INPUT_TEXT.placeholder.active
          }
          className="flex-1 bg-background border-input px-4 py-2.5 text-sm shadow-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
        />
        <Button
          type="submit"
          disabled={!text.trim() || isSending}
          size="icon"
          className="h-10 w-10 shrink-0 flex items-center"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
