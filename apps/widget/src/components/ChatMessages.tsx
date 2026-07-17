import React, { useEffect, useRef } from "react";
import { User2, Bot } from "lucide-react";
import { IMessage } from "@supportflow/shared-types";
import { useChatStore } from "../store/chatStore";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { CardContent } from "@supportflow/ui/src/components/ui/card";

interface ChatMessagesProps {
  messages: IMessage[];
  totalInDb: number;
  showLoader: boolean;
  isFetching: boolean;
  onLoadMore: () => void;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  totalInDb,
  showLoader,
  isFetching,
  onLoadMore,
}) => {
  const typingStatus = useChatStore((state) => state.typingStatus);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStatus]);

  return (
    <CardContent className="flex-1 p-4 bg-background/50 flex flex-col min-h-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-3 h-full [scrollbar-width:thin]">
        {showLoader ? (
          <div className="flex items-center justify-center h-full min-h-[350px] text-xs text-muted-foreground">
            Đang kết nối hệ thống...
          </div>
        ) : (
          <div className="space-y-4 pb-2">
            {messages.length < totalInDb && (
              <div className="flex justify-center my-1">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={isFetching}
                  onClick={onLoadMore}
                  className="text-xs h-7 rounded-full text-muted-foreground px-3"
                >
                  {isFetching ? "Đang tải..." : "Tải tin nhắn cũ"}
                </Button>
              </div>
            )}

            {messages.map((msg) => {
              const isCustomer = msg.sender === "CUSTOMER";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 max-w-[85%] ${isCustomer ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                >
                  {!isCustomer && (
                    <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md border border-border bg-card">
                      {msg.sender === "ADMIN" ? (
                        <User2 className="h-3 w-3 text-primary" />
                      ) : (
                        <Bot className="h-3 w-3 text-primary" />
                      )}
                    </div>
                  )}
                  <div
                    className={`relative px-3.5 py-2 text-sm rounded-lg ${isCustomer ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm" : "bg-card text-foreground border border-border rounded-tl-none"}`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {typingStatus.isTyping && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto mt-4 pb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card">
              {typingStatus.sender === "ADMIN" ? (
                <User2 className="h-3 w-3 text-primary" />
              ) : (
                <Bot className="h-3 w-3 text-purple-500 animate-pulse" />
              )}
            </div>
            <div className="bg-card border border-border px-3.5 py-2.5 rounded-lg rounded-tl-none flex flex-col gap-1 shadow-sm">
              {typingStatus.sender === "AI" && (
                <span className="text-[9px] text-purple-500 font-medium animate-pulse">
                  AI đang phân tích...
                </span>
              )}
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300 delay-75"></span>
                <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300 delay-150"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </CardContent>
  );
};
