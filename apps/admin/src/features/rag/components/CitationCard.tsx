import React from "react";
import { Citation } from "../services/rag.api";
import { FileText, Percent } from "lucide-react";

interface CitationCardProps {
  citation: Citation;
  index: number;
}

export const CitationCard: React.FC<CitationCardProps> = ({
  citation,
  index,
}) => {
  const scorePercent = (citation.score * 100).toFixed(1);

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-all hover:border-primary/50">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <FileText className="h-4 w-4" />
          <span>Trích dẫn #{index + 1}</span>
        </div>
        <div className="flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          <Percent className="h-3 w-3" />
          <span>{scorePercent}% match</span>
        </div>
      </div>
      <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">
        "{citation.content}"
      </p>
    </div>
  );
};
