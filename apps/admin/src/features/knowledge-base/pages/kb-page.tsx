import * as React from "react";
import { useKb } from "@/features/knowledge-base/hooks/use-kb";
import { KbUploadZone } from "@/features/knowledge-base/components/kb-upload-zone";
import { KbDocumentTable } from "@/features/knowledge-base/components/kb-document-table";
import { Button } from "@supportflow/ui/src/components/ui/button";

export default function KnowledgeBasePage() {
  const [currentPage, setCurrentPage] = React.useState(1);

  const {
    documents,
    pagination,
    isLoading,
    isUploading,
    isDeleting,
    uploadDocument,
    deleteDocument,
  } = useKb(currentPage, 10);

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

        {/* Chỉ cần truyền duy nhất hàm deleteDocument từ hook xuống */}
        <KbDocumentTable
          documents={documents}
          isLoading={isLoading}
          onDelete={deleteDocument}
          isDeleting={isDeleting}
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
