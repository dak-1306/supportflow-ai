import React from "react";
import { X } from "lucide-react";
import logo from "@supportflow/ui/src/assets/logo.svg";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { CardHeader } from "@supportflow/ui/src/components/ui/card";

interface ChatHeaderProps {
  onClose: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose }) => (
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
      onClick={onClose}
      className="h-8 w-8 text-muted-foreground hover:text-foreground flex items-center justify-center rounded-md transition-colors focus:outline-none"
    >
      <X className="w-4 h-4" />
    </Button>
  </CardHeader>
);
