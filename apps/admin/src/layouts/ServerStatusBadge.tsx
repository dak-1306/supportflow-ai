import { useEffect, useState } from "react";
import { checkServerHealth } from "@/features/errors/services/health.service";

const SERVER_STATUS_TEXT = {
  onlineText: "Kết nối Server ổn định",
  offlineText: "Không thể kết nối Server (Có thể Render đang ngủ)",
  checkingText: "Checking...",
  onlineStatusText: "Online",
  offlineStatusText: "Offline",
};
export function ServerStatusBadge() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const verifyHealth = async () => {
    const { isAlive } = await checkServerHealth();
    setIsOnline(isAlive);
  };

  useEffect(() => {
    // 1. Check ngay khi component mount
    verifyHealth();

    // 2. Lặp lại mỗi 60 giây (60.000 ms)
    const interval = setInterval(() => {
      verifyHealth();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (isOnline === null) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 border border-border text-[11px] font-medium text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
        {SERVER_STATUS_TEXT.checkingText}
      </div>
    );
  }

  return (
    <div
      title={
        isOnline
          ? SERVER_STATUS_TEXT.onlineText
          : SERVER_STATUS_TEXT.offlineText
      }
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors select-none ${
        isOnline
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/10 border-destructive/20 text-destructive"
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isOnline && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isOnline ? "bg-emerald-500" : "bg-destructive"
          }`}
        />
      </span>
      <span>
        {isOnline
          ? SERVER_STATUS_TEXT.onlineStatusText
          : SERVER_STATUS_TEXT.offlineStatusText}
      </span>
    </div>
  );
}
