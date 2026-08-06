import React, { useRef } from "react";
import { IWorkspaceWidgetConfig } from "@supportflow/shared-types";
import { WidgetPreview } from "./WidgetPreview";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useUploadImageMutation } from "@/shared/hooks/useUpload"; // 🟢 Import Hook

interface WidgetConfigFormProps {
  value: IWorkspaceWidgetConfig;
  onChange: (value: IWorkspaceWidgetConfig) => void;
}

export const WidgetConfigForm: React.FC<WidgetConfigFormProps> = ({
  value,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🟢 Dùng Mutation Hook từ React Query
  const uploadImageMutation = useUploadImageMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log("Uploading file:", file);
    uploadImageMutation.mutate(file, {
      onSuccess: (data) => {
        // Tự động cập nhật URL vào State cha
        onChange({
          ...value,
          botAvatar: data.url,
        });
      },
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAvatar = () => {
    onChange({ ...value, botAvatar: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4 bg-white p-6 rounded-xl border">
        {/* Tiêu đề & Tên Bot */}
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

        {/* Upload Avatar Bot Component */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Avatar AI Bot
          </label>

          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
              {value.botAvatar ? (
                <img
                  src={value.botAvatar}
                  alt="Bot Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-400" />
              )}

              {/* isPending tự động được cung cấp bởi React Query */}
              {uploadImageMutation.isPending && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploadImageMutation.isPending}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImageMutation.isPending}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {uploadImageMutation.isPending
                    ? "Đang tải..."
                    : "Tải ảnh mới"}
                </button>

                {value.botAvatar && !uploadImageMutation.isPending && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Xóa ảnh
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Chấp nhận PNG, JPG, WEBP (Tối đa 2MB).
              </p>
            </div>
          </div>

          {/* Render error từ React Query */}
          {uploadImageMutation.isError && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">
              {uploadImageMutation.error.message || "Tải ảnh thất bại."}
            </p>
          )}
        </div>

        {/* Primary Color & Welcome Message */}
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
