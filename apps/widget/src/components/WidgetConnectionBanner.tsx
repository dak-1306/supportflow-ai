import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { checkServerHealth } from "@/services/health.service";

export function WidgetConnectionBanner() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const verifyHealth = async () => {
    setIsRetrying(true);
    const { isAlive } = await checkServerHealth();
    setIsOnline(isAlive);
    setIsRetrying(false);
  };

  useEffect(() => {
    verifyHealth();

    // Check định kỳ mỗi 45s
    const interval = setInterval(() => {
      verifyHealth();
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Nếu Server bình thường -> Không hiện banner
  if (isOnline === true || isOnline === null) return null;

  return (
    <div className="flex items-center justify-between gap-2 border-b border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Máy chủ đang kết nối lại... (Có thể mất vài giây)</span>
      </div>

      <button
        onClick={verifyHealth}
        disabled={isRetrying}
        className="flex shrink-0 items-center gap-1 rounded bg-destructive/15 px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-destructive/20 active:scale-95 disabled:opacity-50"
      >
        <RefreshCw className={`h-3 w-3 ${isRetrying ? "animate-spin" : ""}`} />
        Thử lại
      </button>
    </div>
  );
}
