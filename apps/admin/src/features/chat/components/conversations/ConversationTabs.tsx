import React from "react";
import { Bot, ShieldAlert, UserCheck } from "lucide-react";
import { ConversationStatus } from "@supportflow/shared-types";

const TAB_TEXT = {
  aiTabText: "AI Bot",
  waitingAdminTabText: "Cần xử lý",
  humanTabText: "Đang hỗ trợ",
};
const TAB_CONFIGS: {
  status: ConversationStatus;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    status: "AI",
    label: TAB_TEXT.aiTabText,
    icon: <Bot className="w-3 h-3 text-purple-500" />,
    activeClass: "bg-background text-foreground shadow-sm",
  },
  {
    status: "WAITING_ADMIN",
    label: TAB_TEXT.waitingAdminTabText,
    icon: <ShieldAlert className="w-3 h-3 text-amber-500 animate-pulse" />,
    activeClass:
      "bg-amber-500/10 text-amber-600 font-semibold border border-amber-500/30",
  },
  {
    status: "HUMAN",
    label: TAB_TEXT.humanTabText,
    icon: <UserCheck className="w-3 h-3 text-emerald-500" />,
    activeClass: "bg-background text-foreground shadow-sm",
  },
];

interface Props {
  currentTab: ConversationStatus;
  onTabChange: (status: ConversationStatus) => void;
}

export const ConversationTabs: React.FC<Props> = ({
  currentTab,
  onTabChange,
}) => {
  return (
    <div className="p-2 border-b border-border grid grid-cols-3 gap-1 bg-muted/30 shrink-0">
      {TAB_CONFIGS.map((tab) => (
        <button
          key={tab.status}
          onClick={() => onTabChange(tab.status)}
          className={`py-1.5 px-2 text-[11px] font-medium rounded-md transition-all flex items-center justify-center gap-1 ${
            currentTab === tab.status
              ? tab.activeClass
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
};
