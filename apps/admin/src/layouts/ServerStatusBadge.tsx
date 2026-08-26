import { useEffect, useState, useCallback } from "react";
import { checkServerHealth } from "@/features/errors/services/health.service";
import { RefreshCw } from "lucide-react";

export function ServerStatusBadge() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const verifyHealth = useCallback(async () => {
    setIsChecking(true);
    const { isAlive } = await checkServerHealth();
    setIsOnline(isAlive);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    verifyHealth();
    const interval = setInterval(verifyHealth, 60000);
    return () => clearInterval(interval);
  }, [verifyHealth]);

  if (isOnline === null) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 border border-border text-[11px] font-medium text-muted-foreground">
        <span className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-pulse" />
        Checking...
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={verifyHealth}
      disabled={isChecking}
      title={
        isOnline
          ? "Máy chủ hoạt động tốt (Click để tải lại)"
          : "Không thể kết nối máy chủ (Click để kiểm tra lại)"
      }
      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all select-none hover:opacity-80 active:scale-95 ${
        isOnline
          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/10 border-destructive/20 text-destructive"
      }`}
    >
      {isChecking ? (
        <RefreshCw className="h-3 w-3 animate-spin" />
      ) : (
        <span className="relative flex h-2 w-2">
          {isOnline && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? "bg-emerald-500" : "bg-destructive"}`}
          />
        </span>
      )}
      <span>{isOnline ? "Online" : "Offline"}</span>
    </button>
  );
}
