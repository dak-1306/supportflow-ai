// components/ui/DataTableShell.tsx
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@supportflow/ui/src/components/ui/table";

export interface ColumnHeader {
  key: string;
  label: React.ReactNode;
  className?: string;
}

interface DataTableShellProps {
  columns: ColumnHeader[];
  isLoading?: boolean;
  isEmpty?: boolean;
  loadingSkeleton?: React.ReactNode;
  emptyState?: React.ReactNode;
  children?: React.ReactNode;
}

export const DataTableShell: React.FC<DataTableShellProps> = ({
  columns,
  isLoading,
  isEmpty,
  loadingSkeleton,
  emptyState,
  children,
}) => {
  if (isLoading && loadingSkeleton) {
    return <>{loadingSkeleton}</>;
  }

  if (!isLoading && isEmpty && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} className={col.className}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                Đang tải...
              </TableCell>
            </TableRow>
          ) : (
            children
          )}
        </TableBody>
      </Table>
    </div>
  );
};
