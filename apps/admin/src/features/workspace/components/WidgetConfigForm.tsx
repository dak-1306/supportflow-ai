import React from "react";
import { IWorkspaceWidgetConfig } from "@supportflow/shared-types";
import { WidgetPreview } from "./WidgetPreview";

interface WidgetConfigFormProps {
  value: IWorkspaceWidgetConfig;
  onChange: (value: IWorkspaceWidgetConfig) => void;
}

export const WidgetConfigForm: React.FC<WidgetConfigFormProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-xl border">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tiêu đề khung chat
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tên Bot hiển thị
          </label>
          <input
            type="text"
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={value.botName}
            onChange={(e) => onChange({ ...value, botName: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Màu chủ đạo (Primary Color)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-10 h-10 border rounded cursor-pointer p-0.5"
              value={value.primaryColor}
              onChange={(e) =>
                onChange({ ...value, primaryColor: e.target.value })
              }
            />
            <span className="text-sm font-mono text-slate-600">
              {value.primaryColor}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Lời chào mặc định
          </label>
          <textarea
            rows={3}
            className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            value={value.welcomeMessage}
            onChange={(e) =>
              onChange({ ...value, welcomeMessage: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-sm font-medium text-slate-600 mb-3">
          Xem trước giao diện Real-time
        </h3>
        <WidgetPreview config={value} />
      </div>
    </div>
  );
};
