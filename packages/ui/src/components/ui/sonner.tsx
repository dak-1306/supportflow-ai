import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ),
        error: (
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
        ),
        warning: (
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        ),
        info: (
          <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        ),
        loading: (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl text-xs font-medium p-3.5 gap-3",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground text-xs font-medium",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground text-xs font-medium",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-700 dark:group-[.toaster]:bg-red-950/40 dark:group-[.toaster]:border-red-900 dark:group-[.toaster]:text-red-300",
          success:
            "group-[.toaster]:bg-emerald-50 group-[.toaster]:border-emerald-200 group-[.toaster]:text-emerald-700 dark:group-[.toaster]:bg-emerald-950/40 dark:group-[.toaster]:border-emerald-900 dark:group-[.toaster]:text-emerald-300",
          warning:
            "group-[.toaster]:bg-amber-50 group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-700 dark:group-[.toaster]:bg-amber-950/40 dark:group-[.toaster]:border-amber-900 dark:group-[.toaster]:text-amber-300",
          info: "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-700 dark:group-[.toaster]:bg-blue-950/40 dark:group-[.toaster]:border-blue-900 dark:group-[.toaster]:text-blue-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
