import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { useKb } from "@/features/knowledge-base/hooks/use-kb";
import { KbUploadZone } from "@/features/knowledge-base/components/kb-upload-zone";
import { KbDocumentTable } from "@/features/knowledge-base/components/kb-document-table";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { KB_UI_TEXT } from "../constants/kb.constants";

export const KnowledgeBasePage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

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
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {KB_UI_TEXT.page.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {KB_UI_TEXT.page.subtitle}
        </p>
      </div>

      <KbUploadZone onUpload={uploadDocument} isUploading={isUploading} />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {KB_UI_TEXT.page.statsTotal} ({pagination.total})
            </h2>
          </div>
        </div>

        <KbDocumentTable
          documents={documents}
          isLoading={isLoading}
          onDelete={deleteDocument}
          isDeleting={isDeleting}
        />

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              Trang <span className="font-semibold">{pagination.page}</span>{" "}
              trên <span className="font-semibold">{pagination.pages}</span>
            </p>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 rounded-lg"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, pagination.pages))
                }
                disabled={currentPage === pagination.pages || isLoading}
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
