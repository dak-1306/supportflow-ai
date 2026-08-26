import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] animate-pulse"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-transform hover:scale-105">
          <SearchX className="h-8 w-8 text-primary" />
        </div>

        <h1 className="bg-gradient-to-b from-primary via-primary/80 to-muted-foreground/30 bg-clip-text text-8xl font-black tracking-tighter text-transparent sm:text-9xl">
          404
        </h1>

        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Trang không tồn tại
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Đường dẫn bạn truy cập có thể đã bị xóa, đổi tên hoặc tạm thời không
          khả dụng.
        </p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang trước đó
          </Button>

          {/* 🟢 Điều hướng thông minh qua Route Root */}
          <Button
            onClick={() => navigate("/")}
            className="gap-2 shadow-md shadow-primary/20"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </Button>
        </div>
      </div>

      <footer className="absolute bottom-6 text-xs text-muted-foreground/60">
        SupportFlow AI &copy; {new Date().getFullYear()} — System Status: Normal
      </footer>
    </div>
  );
}
