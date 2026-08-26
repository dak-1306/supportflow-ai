// features/workspace/pages/WorkspaceSettingsPage.tsx
import React, { useState, useEffect } from "react";
import {
  useWorkspaceQuery,
  useUpdateWorkspaceMutation,
} from "@/features/workspace/hooks/useWorkspace";
import { WidgetConfigForm } from "@/features/workspace/components/WidgetConfigForm";
import { AIConfigForm } from "@/features/workspace/components/AIConfigForm";
import { EmbedScriptTab } from "@/features/workspace/components/EmbedScriptTab";
import { IWorkspaceWidgetConfig } from "@supportflow/shared-types";
import { Code2, Bot, Palette } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@supportflow/ui/src/components/ui/tabs";
import { toast } from "sonner";

const DEFAULT_WIDGET_CONFIG: IWorkspaceWidgetConfig = {
  primaryColor: "#0066FF",
  title: "Hỗ trợ trực tuyến",
  welcomeMessage: "Xin chào! Chúng tôi có thể giúp gì cho bạn?",
  botName: "Support AI",
  botAvatar: "",
};

export const WorkspaceSettingsPage = () => {
  const { data: workspace, isLoading: loading } = useWorkspaceQuery();
  const { mutateAsync: updateWorkspace, isPending: saving } =
    useUpdateWorkspaceMutation();

  // Khôi phục lại state activeTab để điều khiển hiển thị nút Save trên Header
  const [activeTab, setActiveTab] = useState<string>("widget");
  const [widgetForm, setWidgetForm] = useState<IWorkspaceWidgetConfig>(
    DEFAULT_WIDGET_CONFIG,
  );

  useEffect(() => {
    if (workspace?.widgetConfig) {
      setWidgetForm(workspace.widgetConfig);
    }
  }, [workspace?.widgetConfig]);

  const cdnUrl =
    import.meta.env.VITE_WIDGET_CDN_URL ||
    "https://cdn.supportflow.com/widget.js";

  const embedScript =
    workspace?.embedScript ||
    `<script>\n  window.SupportFlowConfig = { workspaceId: "${workspace?.id}" };\n</script>\n<script async src="${cdnUrl}"></script>`;

  const handleSaveWidget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWorkspace({ widgetConfig: widgetForm });
      toast.success("Cập nhật cấu hình Widget thành công!");
    } catch {
      toast.error("Lưu cấu hình thất bại, vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải cấu hình...</div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER & NÚT SAVE QUAY LẠI VỊ TRÍ CŨ */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Cấu hình Workspace ({workspace?.name})
          </h1>
          <p className="text-sm text-slate-500">
            Tùy chỉnh giao diện khung chat và mã nhúng Website.
          </p>
        </div>

        {activeTab === "widget" && (
          <Button
            form="widget-config-form" // <--- Liên kết nút bấm này với ID của form bên dưới
            type="submit"
            variant="default"
            size="lg"
            disabled={saving}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        )}
      </div>

      {/* TABS (Controlled bằng activeTab) */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="widget" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Giao diện Widget</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            <span>AI Agent</span>
          </TabsTrigger>
          <TabsTrigger value="embed" className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span>Mã nhúng</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Widget Config */}
        <TabsContent value="widget">
          {/* Form được cấp ID để nút Save ở trên gọi tới */}
          <form id="widget-config-form" onSubmit={handleSaveWidget}>
            <WidgetConfigForm value={widgetForm} onChange={setWidgetForm} />
          </form>
        </TabsContent>

        {/* Tab 2: AI Config */}
        <TabsContent value="ai">
          {workspace?.aiConfig && <AIConfigForm value={workspace.aiConfig} />}
        </TabsContent>

        {/* Tab 3: Embed Script */}
        <TabsContent value="embed">
          <EmbedScriptTab embedScript={embedScript} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
