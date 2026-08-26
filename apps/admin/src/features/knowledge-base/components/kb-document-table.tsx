import React, { useState, memo } from "react";
import {
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  FileCode,
} from "lucide-react";
import { IDocument, DOCUMENT_STATUS } from "@supportflow/shared-types";
import { TableCell, TableRow } from "@supportflow/ui/src/components/ui/table";
import { Badge } from "@supportflow/ui/src/components/ui/badge";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { DataTableShell, ColumnHeader } from "@/shared/components/DataTableShell";
import { KB_UI_TEXT } from "../constants/kb.constants";

interface KbDocumentTableProps {
  documents: IDocument[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
  isDeleting: boolean;
}

const COLUMNS: ColumnHeader[] = [
  { key: "name", label: KB_UI_TEXT.table.cols.name, className: "w-[35%] font-semibold" },
  { key: "type", label: KB_UI_TEXT.table.cols.type, className: "font-semibold" },
  { key: "size", label: KB_UI_TEXT.table.cols.size, className: "font-semibold" },
  { key: "chunks", label: KB_UI_TEXT.table.cols.chunks, className: "font-semibold" },
  { key: "status", label: KB_UI_TEXT.table.cols.status, className: "font-semibold" },
  { key: "actions", label: KB_UI_TEXT.table.cols.actions, className: "w-[80px] text-right font-semibold" },
];

const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const renderFileTypeBadge = (type: string) => {
  const isPdf = type.toLowerCase().includes("pdf");
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-medium border ${
        isPdf
          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900"
          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900"
      }`}
    >
      {isPdf ? <FileText className="h-3.5 w-3.5" /> : <FileCode className="h-3.5 w-3.5" />}
      {type.toUpperCase()}
    </span>
  );
};

const renderStatus = (status: IDocument["status"]) => {
  switch (status) {
    case DOCUMENT_STATUS.PROCESSING:
      return (
        <Badge
          variant="secondary"
          className="gap-1.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse"
        >
          <Loader2 className="h-3 w-3 animate-spin" />
          {KB_UI_TEXT.table.status.processing}
        </Badge>
      );
    case DOCUMENT_STATUS.READY:
      return (
        <Badge
          variant="default"
          className="gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
        >
          <CheckCircle2 className="h-3 w-3" />
          {KB_UI_TEXT.table.status.ready}
        </Badge>
      );
    case DOCUMENT_STATUS.FAILED:
      return (
        <Badge
          variant="destructive"
          className="gap-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
        >
          <AlertCircle className="h-3 w-3" />
          {KB_UI_TEXT.table.status.failed}
        </Badge>
      );
    default:
      return null;
  }
};

const TableSkeleton = () => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="p-4 space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <div className="h-4 w-1/3 bg-muted/60 rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted/60 rounded animate-pulse" />
          <div className="h-4 w-20 bg-muted/60 rounded animate-pulse" />
          <div className="h-4 w-16 bg-muted/60 rounded animate-pulse" />
          <div className="h-6 w-20 bg-muted/60 rounded-full animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

const EmptyKbState = () => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-12 text-center">
    <div className="p-3 bg-muted rounded-full mb-3 text-muted-foreground">
      <FileText className="h-6 w-6" />
    </div>
    <p className="text-base font-semibold text-foreground">
      {KB_UI_TEXT.table.emptyTitle}
    </p>
    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
      {KB_UI_TEXT.table.emptySubtitle}
    </p>
  </div>
);

export const KbDocumentTable: React.FC<KbDocumentTableProps> = memo(
  ({ documents, isLoading, onDelete, isDeleting }) => {
    const [selectedDocToDelete, setSelectedDocToDelete] =
      useState<IDocument | null>(null);

    const handleConfirmDelete = async () => {
      if (!selectedDocToDelete) return;
      try {
        await onDelete(selectedDocToDelete.id);
      } finally {
        setSelectedDocToDelete(null);
      }
    };

    return (
      <>
        <DataTableShell
          columns={COLUMNS}
          isLoading={isLoading}
          isEmpty={documents.length === 0}
          loadingSkeleton={<TableSkeleton />}
          emptyState={<EmptyKbState />}
        >
          {documents.map((doc) => {
            const isThisDocDeleting =
              isDeleting && selectedDocToDelete?.id === doc.id;

            return (
              <TableRow
                key={doc.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <TableCell
                  className="font-medium max-w-[260px] truncate"
                  title={doc.name}
                >
                  {doc.name}
                </TableCell>
                <TableCell>{renderFileTypeBadge(doc.type)}</TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono">
                  {formatBytes(doc.size)}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm font-mono">
                  {doc.status === DOCUMENT_STATUS.PROCESSING
                    ? "---"
                    : doc.chunkCount}
                </TableCell>
                <TableCell>{renderStatus(doc.status)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors rounded-lg"
                    onClick={() => setSelectedDocToDelete(doc)}
                    disabled={isThisDocDeleting}
                    aria-label="Xóa tài liệu"
                  >
                    {isThisDocDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </DataTableShell>

        <ConfirmModal
          isOpen={!!selectedDocToDelete}
          onClose={() => setSelectedDocToDelete(null)}
          isLoading={isDeleting}
          variant="danger"
          title={KB_UI_TEXT.modal.deleteTitle}
          confirmText={KB_UI_TEXT.modal.deleteConfirmText}
          description={
            <div className="space-y-3 pt-2">
              <div className="p-3 bg-muted/60 rounded-lg border border-border">
                <p className="text-xs text-muted-foreground">Tài liệu đã chọn:</p>
                <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                  {selectedDocToDelete?.name}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {KB_UI_TEXT.modal.deleteWarning}
              </p>
            </div>
          }
          onConfirm={handleConfirmDelete}
        />
      </>
    );
  },
);

KbDocumentTable.displayName = "KbDocumentTable";