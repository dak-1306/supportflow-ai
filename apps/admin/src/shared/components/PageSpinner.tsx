import { Loader2 } from "lucide-react";

export function PageSpinner() {
  return (
    <div className="flex h-full w-full min-h-[400px] items-center justify-center">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="text-xs font-medium">Đang tải...</span>
      </div>
    </div>
  );
}
