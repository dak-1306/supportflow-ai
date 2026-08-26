// features/workspace/components/WidgetConfigForm.tsx
import React from "react";
import { Label } from "@supportflow/ui/src/components/ui/label";
import { Input } from "@supportflow/ui/src/components/ui/input";
import { Textarea } from "@supportflow/ui/src/components/ui/textarea"; // Thêm component Textarea
import { IWorkspaceWidgetConfig } from "@supportflow/shared-types";
import { WidgetPreview } from "./WidgetPreview";
import { AvatarUpload } from "@/shared/components/AvatarUpload";

interface WidgetConfigFormProps {
  value: IWorkspaceWidgetConfig;
  onChange: (value: IWorkspaceWidgetConfig) => void;
}

export const WidgetConfigForm: React.FC<WidgetConfigFormProps> = ({
  value,
  onChange,
}) => {
  const updateField = (key: keyof IWorkspaceWidgetConfig, val: string) => {
    onChange({ ...value, [key]: val });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Tăng space-y-4 lên space-y-6 để UI thoáng và dễ nhìn hơn */}
      <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="title">Tiêu đề khung chat</Label>
          <Input
            id="title"
            value={value.title}
            onChange={(e) => updateField("title", e.target.value)}
            placeholder="Ví dụ: Hỗ trợ trực tuyến"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="botName">Tên Bot hiển thị</Label>
          <Input
            id="botName"
            value={value.botName}
            onChange={(e) => updateField("botName", e.target.value)}
            placeholder="Ví dụ: SupportBot"
          />
        </div>

        <div className="space-y-2">
          <Label>Avatar AI Bot</Label>
          <AvatarUpload
            value={value.botAvatar}
            onChange={(url) => updateField("botAvatar", url)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryColor">Màu chủ đạo (Primary Color)</Label>
          <div className="flex items-center gap-3">
            {/* Tinh chỉnh UX cho Color Picker */}
            <div className="relative h-10 w-14 overflow-hidden rounded-md border shadow-sm cursor-pointer">
              <input
                id="primaryColor"
                type="color"
                className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer border-0 p-0"
                value={value.primaryColor}
                onChange={(e) => updateField("primaryColor", e.target.value)}
              />
            </div>
            <Input
              type="text"
              className="w-32 font-mono text-sm uppercase"
              value={value.primaryColor}
              onChange={(e) => updateField("primaryColor", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="welcomeMessage">Lời chào mặc định</Label>
          <Textarea
            id="welcomeMessage"
            rows={3}
            value={value.welcomeMessage}
            onChange={(e) => updateField("welcomeMessage", e.target.value)}
            placeholder="Nhập lời chào khi khách hàng mở khung chat..."
            className="resize-none"
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
          Xem trước giao diện
        </h3>
        {/* Có thể thêm wrapper mô phỏng khung điện thoại ở đây nếu WidgetPreview chưa có */}
        <div className="sticky top-6">
          <WidgetPreview config={value} />
        </div>
      </div>
    </div>
  );
};
