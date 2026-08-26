import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ServerCrash, RefreshCw, Home, CheckCircle2 } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { checkServerHealth } from "../services/health.service";

export default function ServerErrorPage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(false);
  const [serverRestored, setServerRestored] = useState<boolean | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleRetry = async () => {
    setIsChecking(true);
    setServerRestored(null);

    const { isAlive } = await checkServerHealth();
    setIsChecking(false);

    if (isAlive) {
      setServerRestored(true);
      // 🟢 Tránh Memory Leak bằng Timer Ref
      timerRef.current = setTimeout(() => {
        navigate("/");
      }, 1500);
    } else {
      setServerRestored(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-destructive/15 blur-[130px] animate-pulse"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive shadow-sm">
          <ServerCrash className="h-8 w-8" />
        </div>

        <h1 className="bg-gradient-to-b from-foreground via-foreground/80 to-muted-foreground/30 bg-clip-text text-8xl font-black tracking-tighter text-transparent sm:text-9xl">
          500
        </h1>

        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Sự cố máy chủ
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Hệ thống đang gặp sự cố gián đoạn tạm thời hoặc máy chủ đang khởi động
          lại. Vui lòng thử kiểm tra lại kết nối.
        </p>

        {serverRestored === true && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            Máy chủ đã hoạt động trở lại! Đang chuyển hướng...
          </div>
        )}

        {serverRestored === false && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-xs font-medium text-destructive">
            Máy chủ vẫn chưa phản hồi. Vui lòng thử lại sau!
          </div>
        )}

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={handleRetry}
            disabled={isChecking}
            className="gap-2 shadow-md shadow-primary/20"
          >
            <RefreshCw
              className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`}
            />
            {isChecking ? "Đang kiểm tra..." : "Thử kết nối lại"}
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-muted-foreground/60">
        SupportFlow AI &copy; {new Date().getFullYear()} — Internal Server Error
      </footer>
    </div>
  );
}
