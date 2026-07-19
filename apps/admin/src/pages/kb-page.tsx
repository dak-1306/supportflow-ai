// src/features/knowledge-base/pages/kb-page.tsx
import * as React from "react";
import { useKb } from "@/features/knowledge-base/hooks/use-kb";
import { KbUploadZone } from "@/features/knowledge-base/components/kb-upload-zone";
import { KbDocumentTable } from "@/features/knowledge-base/components/kb-document-table";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { toast } from "sonner";

export default function KnowledgeBasePage() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Gọi hook tùy biến tích hợp sẵn cơ chế Polling khi có file PROCESSING
  const {
    documents,
    pagination,
    isLoading,
    isUploading,
    uploadDocument,
    deleteDocument,
  } = useKb(currentPage, 10);

  const handleDelete = async (documentId: string) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa tài liệu này? Dữ liệu Vector liên quan sẽ bị hủy bỏ hoàn toàn.",
      )
    )
      return;

    setDeletingId(documentId);
    try {
      await deleteDocument(documentId);
      toast.success("Xóa tài liệu thành công", {
        description: "Tài liệu đã được xóa khỏi hệ thống.",
      });
    } catch (error: any) {
      toast.error("Lỗi xóa tài liệu", {
        description: error.message || "Không thể xóa tài liệu.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col p-6 lg:p-8 gap-6 max-w-6xl mx-auto w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Cơ sở tri thức (Knowledge Base)
        </h1>
        <p className="text-sm text-muted-foreground">
          Tải lên tài liệu hướng dẫn hoặc quy định của doanh nghiệp để huấn
          luyện AI trợ giúp khách hàng tự động.
        </p>
      </div>

      {/* Upload Area */}
      <KbUploadZone onUpload={uploadDocument} isUploading={isUploading} />

      {/* Data Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
            Tài liệu hệ thống ({pagination.total})
          </h2>
        </div>

        <KbDocumentTable
          documents={documents}
          isLoading={isLoading}
          onDelete={handleDelete}
          deletingId={deletingId}
        />

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-md"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Trước
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Trang {pagination.page} trên {pagination.pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="rounded-md"
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, pagination.pages))
              }
              disabled={currentPage === pagination.pages || isLoading}
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
