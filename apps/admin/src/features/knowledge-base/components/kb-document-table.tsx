// src/features/knowledge-base/components/kb-document-table.tsx
import {
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { IDocument } from "@/features/knowledge-base/services/kb.api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@supportflow/ui/src/components/ui/table";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import { Button } from "@supportflow/ui/src/components/ui/button";

interface KbDocumentTableProps {
  documents: IDocument[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  deletingId: string | null;
}

export function KbDocumentTable({
  documents,
  isLoading,
  onDelete,
  deletingId,
}: KbDocumentTableProps) {
  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const renderStatus = (status: IDocument["status"]) => {
    switch (status) {
      case "PROCESSING":
        return (
          <Badge
            variant="secondary"
            className="gap-1 rounded-md bg-muted text-muted-foreground animate-pulse"
          >
            <Loader2 className="h-3 w-3 animate-spin" />
            Đang xử lý
          </Badge>
        );
      case "READY":
        return (
          <Badge
            variant="default"
            className="gap-1 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/10"
          >
            <CheckCircle2 className="h-3 w-3" />
            Sẵn sàng
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="destructive" className="gap-1 rounded-md">
            <AlertCircle className="h-3 w-3" />
            Thất bại
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-12 w-full animate-pulse rounded-md bg-muted/60"
          />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
        <FileText className="h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          Chưa có tài liệu tri thức nào
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          Hãy tải lên tệp văn bản đầu tiên để huấn luyện AI bot.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[40%]">Tên tài liệu</TableHead>
            <TableHead>Định dạng</TableHead>
            <TableHead>Dung lượng</TableHead>
            <TableHead>Số đoạn (Chunks)</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[80px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc._id} className="hover:bg-muted/40">
              <TableCell className="font-medium max-w-[240px] truncate">
                {doc.name}
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {doc.type}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatBytes(doc.size)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {doc.status === "PROCESSING" ? "---" : doc.chunkCount}
              </TableCell>
              <TableCell>{renderStatus(doc.status)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors rounded-md"
                  onClick={() => onDelete(doc._id)}
                  disabled={deletingId === doc._id}
                  aria-label="Xóa tài liệu"
                >
                  {deletingId === doc._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
