import React, { useState, useRef, memo, DragEvent } from "react";
import { UploadCloud, FileText, Loader2, FileCheck } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import { toast } from "sonner";
import { KB_CONFIG, KB_UI_TEXT } from "../constants/kb.constants";
import { IDocument } from "@supportflow/shared-types";

interface KbUploadZoneProps {
  onUpload: (file: File) => Promise<IDocument>;
  isUploading: boolean;
}

export const KbUploadZone: React.FC<KbUploadZoneProps> = memo(
  ({ onUpload, isUploading }) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateAndUpload = async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !KB_CONFIG.ALLOWED_EXTENSIONS.includes(ext as any)) {
        toast.error(KB_UI_TEXT.toast.invalidType, {
          description: KB_UI_TEXT.toast.invalidTypeDesc,
        });
        return;
      }

      if (file.size > KB_CONFIG.MAX_FILE_SIZE_BYTES) {
        toast.error(KB_UI_TEXT.toast.fileTooLarge, {
          description: KB_UI_TEXT.toast.fileTooLargeDesc,
        });
        return;
      }

      await onUpload(file);
    };

    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setIsDragActive(true);
      } else if (e.type === "dragleave") {
        setIsDragActive(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);
      validateAndUpload(e.dataTransfer.files);
    };

    return (
      <div
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragActive
            ? "border-primary bg-primary/10 scale-[1.005] shadow-md"
            : "border-border bg-card hover:bg-muted/40 hover:border-muted-foreground/30"
        } ${isUploading ? "pointer-events-none opacity-80" : "cursor-pointer"}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx"
          onChange={(e) => validateAndUpload(e.target.files)}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 ${
              isDragActive
                ? "bg-primary text-primary-foreground scale-110"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            ) : isDragActive ? (
              <FileCheck className="h-6 w-6 animate-bounce" />
            ) : (
              <UploadCloud className="h-6 w-6" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              {isUploading
                ? KB_UI_TEXT.upload.uploadingTitle
                : KB_UI_TEXT.upload.idleTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {KB_UI_TEXT.upload.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            {KB_UI_TEXT.upload.supportedFormats.map((fmt) => (
              <Badge
                key={fmt}
                variant="outline"
                className="text-[10px] uppercase font-mono px-2 py-0.5"
              >
                {fmt}
              </Badge>
            ))}
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isUploading}
            className="mt-2 rounded-lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            {KB_UI_TEXT.upload.selectButton}
          </Button>
        </div>
      </div>
    );
  },
);

KbUploadZone.displayName = "KbUploadZone";
