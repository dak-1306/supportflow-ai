import { useState } from "react";
import {
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { IDocument } from "@supportflow/shared-types";
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
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { toast } from "sonner";

interface KbDocumentTableProps {
  documents: IDocument[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function KbDocumentTable({
  documents,
  isLoading,
  onDelete,
  isDeleting,
}: KbDocumentTableProps) {
  // Lưu tài liệu đang được chọn để mở Modal xác nhận xóa
  const [selectedDocToDelete, setSelectedDocToDelete] =
    useState<IDocument | null>(null);

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

  // Hàm xử lý gọi API xóa nội bộ
  const handleConfirmDelete = async () => {
    if (!selectedDocToDelete) return;

    console.log("Xóa tài liệu:", selectedDocToDelete);

    try {
      await onDelete(selectedDocToDelete.id);
      toast.success("Xóa tài liệu thành công", {
        description: `Tài liệu "${selectedDocToDelete.name}" đã được xóa khỏi hệ thống.`,
      });
      setSelectedDocToDelete(null); // Đóng modal sau khi xóa thành công
    } catch (error: any) {
      toast.error("Lỗi xóa tài liệu", {
        description: error.message || "Không thể xóa tài liệu.",
      });
    } finally {
      setSelectedDocToDelete(null); // Đóng modal sau khi xóa xong (thành công hay thất bại)
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
          {documents.map((doc) => {
            const isThisDocDeleting =
              isDeleting && selectedDocToDelete?.id === doc.id;

            return (
              <TableRow key={doc.id} className="hover:bg-muted/40">
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
                    onClick={() => setSelectedDocToDelete(doc)}
                    disabled={isThisDocDeleting}
                    aria-label="Xóa tài liệu"
                  >
                    {isThisDocDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Confirm Modal nâng cấp: Hiển thị rõ tên tài liệu sắp xóa */}
      <ConfirmModal
        isOpen={!!selectedDocToDelete}
        onClose={() => setSelectedDocToDelete(null)}
        isLoading={isDeleting}
        variant="danger"
        title="Xác nhận xóa tài liệu"
        confirmText="Xóa tài liệu"
        description={
          <>
            Bạn có chắc chắn muốn xóa tài liệu{" "}
            <strong className="text-foreground font-semibold">
              "{selectedDocToDelete?.name}"
            </strong>
            ? Dữ liệu Vector liên quan sẽ bị hủy bỏ hoàn toàn.
          </>
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
