import React, { useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useUploadImageMutation } from "@/shared/hooks/useUpload";

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

const AVATAR_UPLOAD_TEXT = {
  labelText: "Ảnh đại diện",
  uploadButtonText: "Tải ảnh mới",
  uploadingText: "Đang tải...",
  deleteButtonText: "Xóa ảnh",
  acceptedFormatsText: "Chấp nhận PNG, JPG, WEBP (Tối đa 2MB).",
  uploadErrorText: "Tải ảnh thất bại.",
};

export function AvatarUpload({ value, onChange }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImageMutation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImageMutation.mutate(file, {
      onSuccess: (data) => onChange(data.url),
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-700">
        {AVATAR_UPLOAD_TEXT.labelText}
      </label>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0">
          {value ? (
            <img
              src={value}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}

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
                ? AVATAR_UPLOAD_TEXT.uploadingText
                : AVATAR_UPLOAD_TEXT.uploadButtonText}
            </button>

            {value && !uploadImageMutation.isPending && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />{" "}
                {AVATAR_UPLOAD_TEXT.deleteButtonText}
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {AVATAR_UPLOAD_TEXT.acceptedFormatsText}
          </p>
        </div>
      </div>

      {uploadImageMutation.isError && (
        <p className="text-xs text-red-500 font-medium">
          {uploadImageMutation.error.message ||
            AVATAR_UPLOAD_TEXT.uploadErrorText}
        </p>
      )}
    </div>
  );
}
