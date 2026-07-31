import React from "react";
import { IWorkspaceWidgetConfig } from "@supportflow/shared-types";

interface Props {
  config: IWorkspaceWidgetConfig;
}

export const WidgetPreview: React.FC<Props> = ({ config }) => {
  return (
    <div className="border rounded-xl shadow-lg w-full max-w-xs bg-white overflow-hidden flex flex-col h-[420px]">
      {/* Header */}
      <div
        className="p-4 text-white flex items-center gap-3 transition-colors duration-200"
        style={{ backgroundColor: config.primaryColor || "#0066FF" }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden font-bold">
          {config.botAvatar ? (
            <img
              src={config.botAvatar}
              alt={config.botName}
              className="w-full h-full object-cover"
            />
          ) : (
            config.botName?.charAt(0) || "B"
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm leading-tight">
            {config.title || "Hỗ trợ trực tuyến"}
          </h4>
          <p className="text-xs opacity-80">{config.botName || "Support AI"}</p>
        </div>
      </div>

      {/* Body / Chat Stream */}
      <div className="flex-1 p-4 bg-slate-50 space-y-3 overflow-y-auto">
        <div className="flex gap-2 max-w-[85%]">
          <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm text-xs text-slate-700 border border-slate-100">
            {config.welcomeMessage ||
              "Xin chào! Chúng tôi có thể giúp gì cho bạn?"}
          </div>
        </div>
      </div>

      {/* Input Mockup */}
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <div className="flex-1 bg-slate-100 rounded-full h-8 px-3 text-xs text-slate-400 flex items-center">
          Nhập tin nhắn...
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
          style={{ backgroundColor: config.primaryColor || "#0066FF" }}
        >
          ➤
        </div>
      </div>
    </div>
  );
};
