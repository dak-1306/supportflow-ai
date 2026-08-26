import * as React from "react";
import { cn } from "../../lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-sm transition-all duration-200 outline-none file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        // Trạng thái Focus: Viền chuyển màu chính (primary) + Đổ bóng màu primary rất tinh tế
        "focus-visible:border-primary focus-visible:shadow-[0_0_0_1px_var(--primary)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        // Trạng thái Lỗi: Viền đỏ + Đổ bóng đỏ
        "aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_1px_var(--destructive)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
