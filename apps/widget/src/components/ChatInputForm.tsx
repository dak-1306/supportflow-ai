import React, { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Input } from "@supportflow/ui/src/components/ui/input";
import { CardFooter } from "@supportflow/ui/src/components/ui/card";

interface ChatInputFormProps {
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
  isPending: boolean;
}

export const ChatInputForm: React.FC<ChatInputFormProps> = ({
  onSendMessage,
  onTyping,
  isPending,
}) => {
  const [inputValue, setInputValue] = useState("");
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isPending) return;

    onSendMessage(inputValue.trim());
    setInputValue("");
    onTyping(false);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <CardFooter className="p-3 border-t border-border bg-card shrink-0">
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
        <div className="relative flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all duration-150">
          <Input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Nhập tin nhắn của bạn..."
            className="w-full bg-transparent border-0 px-3 py-2 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!inputValue.trim() || isPending}
            className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-primary transition-colors"
          >
            <Send className="w-4 h-4 mx-auto" />
          </Button>
        </div>
        <div className="text-center">
          <span className="text-xs text-muted-foreground select-none flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> Powered by SupportFlow AI
          </span>
        </div>
      </form>
    </CardFooter>
  );
};
