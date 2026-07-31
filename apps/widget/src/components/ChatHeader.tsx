import React from "react";
import { X } from "lucide-react";
import defaultLogo from "@supportflow/assets/imgs/logo.svg";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { CardHeader } from "@supportflow/ui/src/components/ui/card";

interface ChatHeaderProps {
  onClose: () => void;
  title?: string;
  botName?: string;
  botAvatar?: string;
  logo?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClose,
  title = "Hỗ trợ trực tuyến",
  botName = "Support AI",
  botAvatar,
  logo,
}) => {
  const displayAvatar = botAvatar || logo;

  return (
    <CardHeader className="bg-card border-b border-border p-4 flex flex-row items-center justify-between space-y-0 shrink-0">
      <div className="flex items-center gap-3">
        {/* Avatar hoặc Logo công ty */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary overflow-hidden border border-border">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt={botName}
              className="h-full w-full object-cover"
            />
          ) : (
            <img src={defaultLogo} alt="Logo" className="h-5 w-5" />
          )}
        </div>

        <div>
          <h3 className="font-semibold text-sm tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            {botName}
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
};
