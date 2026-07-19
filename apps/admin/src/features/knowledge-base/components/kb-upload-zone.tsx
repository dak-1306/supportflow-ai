// src/features/knowledge-base/components/kb-upload-zone.tsx
import * as React from "react";
import { UploadCloud, FileText, Loader2 } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { toast } from "sonner";

interface KbUploadZoneProps {
  onUpload: (file: File) => Promise<any>;
  isUploading: boolean;
}

export function KbUploadZone({ onUpload, isUploading }: KbUploadZoneProps) {
  const [isDragActive, setIsDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate client-side dựa trên Design System Form/Rules
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx") {
      toast.error("Định dạng file không hợp lệ", {
        description: "Chỉ hỗ trợ định dạng PDF và DOCX",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file quá lớn", {
        description: "Chỉ hỗ trợ file tối đa 10MB",
      });
      return;
    }

    try {
      await onUpload(file);
      toast.success("Tải lên thành công", {
        description: "Tài liệu đã được tải lên và đang xử lý.",
      });
    } catch (error: any) {
      toast.error("Lỗi tải lên tài liệu", {
        description: error.message || "Không thể tải lên tài liệu.",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      className={`relative rounded-xl border border-dashed p-6 text-center transition-colors ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-muted/50"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <UploadCloud className="h-5 w-5" />
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">
            {isUploading ? "Đang xử lý tập tin..." : "Kéo thả tài liệu vào đây"}
          </p>
          <p className="text-xs text-muted-foreground">
            Hỗ trợ định dạng PDF, DOCX tối đa 10MB
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md"
        >
          <FileText className="mr-2 h-4 w-4" />
          Chọn tệp tin
        </Button>
      </div>
    </div>
  );
}
