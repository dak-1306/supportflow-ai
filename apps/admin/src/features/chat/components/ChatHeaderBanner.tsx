import React from "react";
import { ShieldAlert, UserCheck, Bot, CheckCircle2 } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { ConversationStatus } from "@supportflow/shared-types";

export type ConfirmType = "RESOLVE" | "ENABLE_AI" | "TAKE_OVER" | null;

interface Props {
  status: ConversationStatus | string;
  isTakeOverPending: boolean;
  isEnableAIPending: boolean;
  isResolvePending: boolean;
  onOpenModal: (type: ConfirmType) => void;
}

const CHAT_HEADER_BANNER_TEXT = {
  waitingAdminText:
    "AI đã tạm ngưng do độ tin cậy thấp. Khách hàng đang chờ Admin hỗ trợ!",
  humanText: "Bạn đang tiếp quản hội thoại này (AI đã tắt).",
  takeOverButtonText: "Tiếp Quản Ngay",
  takeOverButtonPendingText: "Đang tiếp quản...",
  enableAIButtonText: "Bật AI Bot",
  enableAIButtonPendingText: "Đang bật...",
  resolveButtonText: "Hoàn thành",
  resolveButtonPendingText: "Đang hoàn thành...",
};

export const ChatHeaderBanner: React.FC<Props> = ({
  status,
  isTakeOverPending,
  isEnableAIPending,
  isResolvePending,
  onOpenModal,
}) => {
  if (status === "WAITING_ADMIN") {
    return (
      <div className="bg-amber-500/10 border-b border-amber-500/20 p-3 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 text-amber-600 text-xs font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 animate-bounce" />
          <span>{CHAT_HEADER_BANNER_TEXT.waitingAdminText}</span>
        </div>
        <Button
          size="sm"
          onClick={() => onOpenModal("TAKE_OVER")}
          disabled={isTakeOverPending}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3 rounded-lg shadow-sm"
        >
          <UserCheck className="w-3.5 h-3.5 mr-1.5" />
          {isTakeOverPending
            ? CHAT_HEADER_BANNER_TEXT.takeOverButtonPendingText
            : CHAT_HEADER_BANNER_TEXT.takeOverButtonText}
        </Button>
      </div>
    );
  }

  if (status === "HUMAN") {
    return (
      <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-2.5 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-medium">
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>{CHAT_HEADER_BANNER_TEXT.humanText}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-purple-500 hover:bg-purple-600 text-white text-xs h-8 px-3 rounded-lg shadow-sm flex items-center"
            onClick={() => onOpenModal("ENABLE_AI")}
            disabled={isEnableAIPending}
          >
            <Bot className="w-3.5 h-3.5 mr-1 text-white" />
            {isEnableAIPending
              ? CHAT_HEADER_BANNER_TEXT.enableAIButtonPendingText
              : CHAT_HEADER_BANNER_TEXT.enableAIButtonText}
          </Button>
          <Button
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-3 rounded-lg shadow-sm flex items-center"
            onClick={() => onOpenModal("RESOLVE")}
            disabled={isResolvePending}
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {isResolvePending
              ? CHAT_HEADER_BANNER_TEXT.resolveButtonPendingText
              : CHAT_HEADER_BANNER_TEXT.resolveButtonText}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
