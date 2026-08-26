// features/workspace/components/EmbedScriptTab.tsx
import React from "react";
import { Copy, Check } from "lucide-react";
import { useCopyToClipboard } from "@/shared/hooks/useCopyToClipboard";
import { toast } from "sonner";

export const EmbedScriptTab: React.FC<{ embedScript: string }> = ({
  embedScript,
}) => {
  const { isCopied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copy(embedScript);
    if (success) {
      // Chỉ bật toast nếu bạn thấy đổi icon ở nút là chưa đủ phê
      toast.success("Đã sao chép đoạn mã cài đặt");
    } else {
      toast.error("Trình duyệt không hỗ trợ hoặc có lỗi xảy ra");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border max-w-3xl space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Mã Script cài đặt Widget
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Sao chép đoạn mã bên dưới và dán vào thẻ{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">
            &lt;head&gt;
          </code>{" "}
          hoặc trước thẻ đóng{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-600 font-mono">
            &lt;/body&gt;
          </code>
          .
        </p>
      </div>

      <div className="relative">
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
          {embedScript}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute top-3 right-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-green-400" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          <span>{isCopied ? "Đã sao chép" : "Sao chép mã"}</span>
        </button>
      </div>
    </div>
  );
};
