import React, { useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Label } from "@supportflow/ui/src/components/ui/label";
import { FormAlert } from "@/shared/components/form-alert";
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
} as const;

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
    <div className="space-y-2">
      <Label className="text-xs font-medium">
        {AVATAR_UPLOAD_TEXT.labelText}
      </Label>

      <div className="flex items-center gap-4">
        {/* Avatar Preview */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-muted flex items-center justify-center">
          {value ? (
            <img
              src={value}
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          )}

          {uploadImageMutation.isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[1px]">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploadImageMutation.isPending}
          />

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadImageMutation.isPending}
              className="h-8 text-xs gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploadImageMutation.isPending
                ? AVATAR_UPLOAD_TEXT.uploadingText
                : AVATAR_UPLOAD_TEXT.uploadButtonText}
            </Button>

            {value && !uploadImageMutation.isPending && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange("")}
                className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1"
              >
                <X className="h-3.5 w-3.5" />
                {AVATAR_UPLOAD_TEXT.deleteButtonText}
              </Button>
            )}
          </div>

          <p className="text-[11px] text-muted-foreground">
            {AVATAR_UPLOAD_TEXT.acceptedFormatsText}
          </p>
        </div>
      </div>

      {uploadImageMutation.isError && (
        <FormAlert
          type="error"
          message={
            uploadImageMutation.error.message ||
            AVATAR_UPLOAD_TEXT.uploadErrorText
          }
        />
      )}
    </div>
  );
}
