import { AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export type AlertType = "error" | "success" | "warning" | "info";

interface FormAlertProps {
  type?: AlertType;
  message?: string | null;
  className?: string;
}

// Cấu hình UI cho từng loại alert để dễ mở rộng
const ALERT_CONFIG = {
  error: {
    icon: AlertCircle,
    styles: "bg-red-50 border-red-200 text-red-600 animate-shake",
  },
  success: {
    icon: CheckCircle2,
    styles: "bg-green-50 border-green-200 text-green-700",
  },
  warning: {
    icon: AlertTriangle,
    styles: "bg-amber-50 border-amber-200 text-amber-700",
  },
  info: {
    icon: Info,
    styles: "bg-blue-50 border-blue-200 text-blue-700",
  },
} as const;

export function FormAlert({
  type = "error",
  message,
  className = "",
}: FormAlertProps) {
  if (!message) return null;

  const { icon: Icon, styles } = ALERT_CONFIG[type] || ALERT_CONFIG.error;

  return (
    <div
      className={`p-3.5 border rounded-xl flex items-start gap-3 text-xs ${styles} ${className}`}
    >
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
