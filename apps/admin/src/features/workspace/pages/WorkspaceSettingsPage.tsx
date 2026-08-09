import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { WidgetConfigForm } from "@/features/workspace/components/WidgetConfigForm";
import { AIConfigForm } from "@/features/workspace/components/AIConfigForm";
import { EmbedScriptTab } from "@/features/workspace/components/EmbedScriptTab";
import {
  IWorkspaceAIConfig,
  IWorkspaceWidgetConfig,
} from "@supportflow/shared-types";
import { Code2 } from "lucide-react";

export const WorkspaceSettingsPage = () => {
  const { workspace, loading, saving, error, updateWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"widget" | "ai" | "embed">(
    "widget",
  );
  const [successMsg, setSuccessMsg] = useState("");

  const [widgetForm, setWidgetForm] = useState<IWorkspaceWidgetConfig>({
    primaryColor: "#0066FF",
    title: "Hỗ trợ trực tuyến",
    welcomeMessage: "Xin chào! Chúng tôi có thể giúp gì cho bạn?",
    botName: "Support AI",
    botAvatar: "",
  });

  const [aiForm, setAiForm] = useState<IWorkspaceAIConfig>({
    provider: "gemini",
    model: "gemini-3.5-flash",
    temperature: 0.7,
    systemPrompt:
      "Bạn là trợ lý AI hỗ trợ khách hàng lịch sự và chuyên nghiệp.",
  });

  useEffect(() => {
    if (workspace) {
      if (workspace.widgetConfig) setWidgetForm(workspace.widgetConfig);
      if (workspace.aiConfig) setAiForm(workspace.aiConfig);
    }
  }, [workspace]);

  const cdnUrl =
    import.meta.env.VITE_WIDGET_CDN_URL ||
    "https://cdn.supportflow.com/widget.js";
  const embedScript =
    workspace?.embedScript ||
    `<script>\n  window.SupportFlowConfig = { workspaceId: "${workspace?.id}" };\n</script>\n<script async src="${cdnUrl}"></script>`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");

    try {
      await updateWorkspace({
        widgetConfig: widgetForm,
      });
      setSuccessMsg("Cập nhật cấu hình Workspace thành công!");
    } catch {
      // Error state được quản lý bởi hook
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải cấu hình...</div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cấu hình Workspace ({workspace?.name})
          </h1>
          <p className="text-sm text-slate-500">
            Tùy chỉnh giao diện khung chat, xem thông số AI Bot và lấy mã nhúng
            Website.
          </p>
        </div>

        {/* 🟢 Chỉ cho phép Lưu khi ở Tab Widget */}
        {activeTab === "widget" && (
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        )}
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
          {successMsg}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-4 border-b">
        <button
          className={`pb-3 px-2 font-medium text-sm ${
            activeTab === "widget"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("widget")}
        >
          🎨 Giao diện Chat Widget
        </button>
        <button
          className={`pb-3 px-2 font-medium text-sm ${
            activeTab === "ai"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("ai")}
        >
          🤖 Cấu hình AI Agent
        </button>
        <button
          className={`pb-3 px-2 font-medium text-sm flex items-center gap-1.5 ${
            activeTab === "embed"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-slate-500 hover:text-slate-700"
          }`}
          onClick={() => setActiveTab("embed")}
        >
          <Code2 className="w-4 h-4" /> Mã nhúng Website
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "widget" && (
        <WidgetConfigForm value={widgetForm} onChange={setWidgetForm} />
      )}
      {activeTab === "ai" && <AIConfigForm value={aiForm} />}
      {activeTab === "embed" && <EmbedScriptTab embedScript={embedScript} />}
    </div>
  );
};
