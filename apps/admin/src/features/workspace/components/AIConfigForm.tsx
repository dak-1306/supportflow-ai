import React from "react";
import { IWorkspaceAIConfig } from "@supportflow/shared-types";

interface AIConfigFormProps {
  value: IWorkspaceAIConfig;
  onChange: (value: IWorkspaceAIConfig) => void;
}

export const AIConfigForm: React.FC<AIConfigFormProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border max-w-2xl space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Provider AI
        </label>
        <select
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          value={value.provider}
          onChange={(e) => onChange({ ...value, provider: e.target.value })}
        >
          <option value="gemini">Google Gemini</option>
          <option value="openai">OpenAI</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Model
        </label>
        <input
          type="text"
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={value.model}
          onChange={(e) => onChange({ ...value, model: e.target.value })}
        />
      </div>

      <div>
        <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
          <span>Độ sáng tạo (Temperature)</span>
          <span>{value.temperature}</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          className="w-full accent-blue-600 cursor-pointer"
          value={value.temperature}
          onChange={(e) =>
            onChange({
              ...value,
              temperature: parseFloat(e.target.value),
            })
          }
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          System Prompt (Chỉ thị hệ thống cho Bot)
        </label>
        <textarea
          rows={5}
          className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none font-mono text-xs"
          value={value.systemPrompt}
          onChange={(e) => onChange({ ...value, systemPrompt: e.target.value })}
        />
      </div>
    </div>
  );
};
