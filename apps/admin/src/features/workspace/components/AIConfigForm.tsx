// features/workspace/components/AIConfigForm.tsx
import React from "react";
import { IWorkspaceAIConfig } from "@supportflow/shared-types";
import { Lock } from "lucide-react";

const PROVIDER_NAMES: Record<string, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
};

export const AIConfigForm: React.FC<{ value: IWorkspaceAIConfig }> = ({
  value,
}) => (
  <div className="bg-white p-6 rounded-xl border max-w-2xl space-y-4">
    <div className="p-3 bg-amber-50 text-amber-800 rounded-lg text-xs border border-amber-200 flex items-center gap-2">
      <Lock className="w-4 h-4 shrink-0 text-amber-600" />
      <span>
        Các tham số AI được tối ưu và quản lý mặc định bởi hệ thống (Chế độ chỉ
        xem).
      </span>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Provider AI
        </label>
        <div className="w-full border bg-slate-50 rounded-lg p-2.5 text-sm font-medium text-slate-700 cursor-not-allowed select-none">
          {PROVIDER_NAMES[value.provider] || value.provider}
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Model
        </label>
        <div className="w-full border bg-slate-50 rounded-lg p-2.5 text-sm font-mono text-slate-700 cursor-not-allowed select-none">
          {value.model}
        </div>
      </div>
    </div>

    <div>
      <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
        <span>Độ sáng tạo (Temperature)</span>
        <span className="font-mono text-slate-700">{value.temperature}</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        disabled
        className="w-full accent-blue-600 opacity-60 cursor-not-allowed"
        value={value.temperature}
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        System Prompt
      </label>
      <textarea
        rows={5}
        readOnly
        disabled
        className="w-full border bg-slate-50 rounded-lg p-2.5 text-xs font-mono text-slate-600 cursor-not-allowed resize-none"
        value={value.systemPrompt}
      />
    </div>
  </div>
);
