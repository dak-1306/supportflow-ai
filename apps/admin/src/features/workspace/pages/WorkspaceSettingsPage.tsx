import React, { useState, useEffect } from "react";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { WidgetPreview } from "@/features/workspace/components/WidgetPreview";
import {
  IWorkspaceAIConfig,
  IWorkspaceWidgetConfig,
} from "@supportflow/shared-types";

export const WorkspaceSettingsPage = () => {
  const { workspace, loading, saving, error, updateWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"widget" | "ai">("widget");

  // Local Form States
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

  const [successMsg, setSuccessMsg] = useState("");

  // Sync data khi API trả về
  useEffect(() => {
    if (workspace) {
      if (workspace.widgetConfig) setWidgetForm(workspace.widgetConfig);
      if (workspace.aiConfig) setAiForm(workspace.aiConfig);
    }
  }, [workspace]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg("");

    try {
      await updateWorkspace({
        widgetConfig: widgetForm,
        aiConfig: aiForm,
      });
      setSuccessMsg("Cập nhật cấu hình Workspace thành công!");
    } catch (err) {
      // React Query đã tự cập nhật error state
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải cấu hình...</div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cấu hình Workspace ({workspace?.name})
          </h1>
          <p className="text-sm text-slate-500">
            Tùy chỉnh giao diện khung chat và tham số cho AI Bot.
          </p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

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

      {/* Tabs Navigation */}
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
      </div>

      {/* Tab Content: Widget Config */}
      {activeTab === "widget" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-xl border">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tiêu đề khung chat
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={widgetForm.title}
                onChange={(e) =>
                  setWidgetForm({ ...widgetForm, title: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên Bot hiển thị
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={widgetForm.botName}
                onChange={(e) =>
                  setWidgetForm({ ...widgetForm, botName: e.target.value })
                }
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
                  value={widgetForm.primaryColor}
                  onChange={(e) =>
                    setWidgetForm({
                      ...widgetForm,
                      primaryColor: e.target.value,
                    })
                  }
                />
                <span className="text-sm font-mono text-slate-600">
                  {widgetForm.primaryColor}
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
                value={widgetForm.welcomeMessage}
                onChange={(e) =>
                  setWidgetForm({
                    ...widgetForm,
                    welcomeMessage: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Sidebar xem trước */}
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-medium text-slate-600 mb-3">
              Xem trước giao diện Real-time
            </h3>
            <WidgetPreview config={widgetForm} />
          </div>
        </div>
      )}

      {/* Tab Content: AI Config */}
      {activeTab === "ai" && (
        <div className="bg-white p-6 rounded-xl border max-w-2xl space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Provider AI
            </label>
            <select
              className="w-full border rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={aiForm.provider}
              onChange={(e) =>
                setAiForm({ ...aiForm, provider: e.target.value })
              }
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
              value={aiForm.model}
              onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })}
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium text-slate-700 mb-1">
              <span>Độ sáng tạo (Temperature)</span>
              <span>{aiForm.temperature}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="w-full accent-blue-600 cursor-pointer"
              value={aiForm.temperature}
              onChange={(e) =>
                setAiForm({
                  ...aiForm,
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
              value={aiForm.systemPrompt}
              onChange={(e) =>
                setAiForm({ ...aiForm, systemPrompt: e.target.value })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};
