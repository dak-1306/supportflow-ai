import React, { useState, useEffect, useRef } from "react";
import logo from "@supportflow/ui/src/assets/logo.svg";
// Import bổ sung icon Bot ở đây
import { MessageCircle, X, Send, User2, Sparkles, Bot } from "lucide-react";
import { useChatStore } from "../store/chatStore";
import { useChatSocket } from "../hooks/useChatSocket";
import {
  useWidgetMessagesQuery,
  useWidgetSendMessageMutation,
} from "../hooks/useChatQueries";
import { chatApi } from "../services/api";

import { Button } from "@supportflow/ui/src/components/ui/button";
import { Input } from "@supportflow/ui/src/components/ui/input";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@supportflow/ui/src/components/ui/card";
import { ScrollArea } from "@supportflow/ui/src/components/ui/scroll-area";
import { IMessage } from "@supportflow/shared-types"; // Import Interface chung

export const ChatWidget: React.FC = () => {
  const {
    isOpen,
    setIsOpen,
    customerId,
    conversationId,
    setChatSession,
    isAdminTyping,
  } = useChatStore();

  const [page, setPage] = useState(1);
  const [initLoading, setInitLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const { emitTypingStatus } = useChatSocket(page, 50); // Truyền page và limit vào hook useChatSocket

  const {
    data,
    isLoading: queryLoading,
    isFetching,
  } = useWidgetMessagesQuery(conversationId, page);
  const sendMessageMutation = useWidgetSendMessageMutation(conversationId);

  const dbMessages: IMessage[] = data?.messages || [];
  const totalInDb = data?.total || 0;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dbMessages, isAdminTyping]);

  const handleToggleWidget = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && !conversationId) {
      try {
        setInitLoading(true);
        const data = await chatApi.initConversation(customerId);
        // Thay đổi trường _id sang id lấy từ API mới của server
        setChatSession(data.customerId, data.conversation.id);
        setPage(1);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
      } finally {
        setInitLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    emitTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStatus(false);
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId || sendMessageMutation.isPending)
      return;

    const text = inputValue.trim();
    setInputValue("");
    emitTypingStatus(false);

    sendMessageMutation.mutate(text);
  };

  const showLoader =
    initLoading || (conversationId && queryLoading && page === 1);

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans flex flex-col items-end antialiased">
      {isOpen && (
        <Card className="border border-border bg-card shadow-md w-[380px] h-[550px] max-w-[calc(100vw-40px)] flex flex-col mb-4 overflow-hidden rounded-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          <CardHeader className="bg-card border-b border-border p-4 flex flex-row items-center justify-between space-y-0 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-primary">
                <img src={logo} alt="Logo" className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-tight text-foreground">
                  Hỗ trợ trực tuyến
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  AI & Đội ngũ hỗ trợ
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleWidget}
              className="h-8 w-8 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>

          {/* Khung chứa nội dung tin nhắn */}
          {/* Khung chứa nội dung tin nhắn */}
          <CardContent className="flex-1 p-4 bg-background/50 flex flex-col min-h-0 overflow-hidden">
            {/* Thay ScrollArea bằng thẻ div này */}
            <div className="flex-1 overflow-y-auto pr-3 h-full [scrollbar-width:thin]">
              {showLoader ? (
                <div className="flex items-center justify-center h-full min-h-[350px] text-xs text-muted-foreground">
                  Đang kết nối hệ thống...
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {dbMessages.length < totalInDb && (
                    <div className="flex justify-center my-1">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={isFetching}
                        onClick={() => setPage((prev) => prev + 1)}
                        className="text-xs h-7 rounded-full text-muted-foreground px-3"
                      >
                        {isFetching ? "Đang tải..." : "Tải tin nhắn cũ"}
                      </Button>
                    </div>
                  )}

                  {dbMessages.map((msg) => {
                    const isCustomer = msg.sender === "CUSTOMER";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 max-w-[85%] ${
                          isCustomer ? "ml-auto flex-row-reverse" : "mr-auto"
                        }`}
                      >
                        {!isCustomer && (
                          <div className="flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md border border-border bg-card text-foreground">
                            {msg.sender === "ADMIN" ? (
                              <User2 className="h-3 w-3 text-primary" />
                            ) : (
                              <Bot className="h-3 w-3 text-primary" />
                            )}
                          </div>
                        )}

                        <div
                          className={`relative px-3.5 py-2 text-sm rounded-lg ${
                            isCustomer
                              ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                              : "bg-card text-foreground border border-border rounded-tl-none"
                          }`}
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

              {isAdminTyping && (
                <div className="flex gap-2.5 max-w-[85%] mr-auto mt-4 pb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-card">
                    <User2 className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-card border border-border px-3.5 py-2.5 rounded-lg rounded-tl-none flex items-center gap-1 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300 delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce duration-300 delay-150"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>{" "}
            {/* Đóng thẻ div */}
          </CardContent>

          <CardFooter className="p-3 border-t border-border bg-card shrink-0">
            <form
              onSubmit={handleSendMessage}
              className="w-full flex flex-col gap-2"
            >
              <div className="relative flex items-center rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-all duration-150">
                <Input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Nhập tin nhắn của bạn..."
                  className="w-full bg-transparent border-0 px-3 py-2 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
                />
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  disabled={!inputValue.trim() || sendMessageMutation.isPending}
                  className="absolute right-1 h-7 w-7 text-muted-foreground hover:text-primary disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="text-center">
                <span className="text-[10px] text-muted-foreground select-none flex items-center justify-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Powered by SupportFlow AI
                </span>
              </div>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={handleToggleWidget}
        size="icon"
        className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-md hover:scale-105 active:scale-95 transition-transform duration-150 flex items-center justify-center"
        aria-label="Mở khung hỗ trợ"
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <MessageCircle className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
};
