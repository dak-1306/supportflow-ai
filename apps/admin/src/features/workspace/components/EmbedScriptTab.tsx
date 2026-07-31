import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface EmbedScriptTabProps {
  embedScript: string;
}

export const EmbedScriptTab: React.FC<EmbedScriptTabProps> = ({
  embedScript,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 rounded-xl border max-w-3xl space-y-4">
      <div>
        <h3 className="text-base font-semibold text-slate-800">
          Mã Script cài đặt Widget
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Sao chép đoạn mã bên dưới và dán vào thẻ{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600">
            &lt;head&gt;
          </code>{" "}
          hoặc trước thẻ đóng{" "}
          <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-blue-600">
            &lt;/body&gt;
          </code>{" "}
          trên website của bạn.
        </p>
      </div>

      <div className="relative">
        <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
          {embedScript}
        </pre>
        <button
          onClick={handleCopyScript}
          className="absolute top-3 right-3 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span>Đã sao chép</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Sao chép mã</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
