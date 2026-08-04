import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, SearchX } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* 1. Ambient Glow Background Effect (Hiệu ứng ánh sáng nền) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] animate-pulse"
        aria-hidden="true"
      />

      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        {/* 2. Badge & Icon Container */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card shadow-sm transition-transform hover:scale-105">
          <SearchX className="h-8 w-8 text-primary" />
        </div>

        {/* 3. Big 404 Typography */}
        <h1 className="bg-gradient-to-b from-primary via-primary/80 to-muted-foreground/30 bg-clip-text text-8xl font-black tracking-tighter text-transparent sm:text-9xl">
          404
        </h1>

        {/* 4. Text Content */}
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Trang không tồn tại
        </h2>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Đường dẫn bạn truy cập có thể đã bị xóa, đổi tên hoặc tạm thời không
          khả dụng. Vui lòng kiểm tra lại địa chỉ URL.
        </p>

        {/* 5. Action Buttons (Điều hướng UX tối ưu) */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang trước đó
          </button>

          <button
            onClick={() => navigate("/chat")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20"
          >
            <Home className="h-4 w-4" />
            Về trang chủ
          </button>
        </div>
      </div>

      {/* Footer nhỏ tạo nét chỉn chu cho trang */}
      <footer className="absolute bottom-6 text-xs text-muted-foreground/60">
        SupportFlow AI &copy; {new Date().getFullYear()} — System Status: Normal
      </footer>
    </div>
  );
}
