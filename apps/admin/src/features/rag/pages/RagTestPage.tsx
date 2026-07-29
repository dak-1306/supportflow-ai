import React from "react";
import { useRag } from "@/features/rag/hooks/useRag";
import { RagTestForm } from "@/features/rag/components/RagTestForm";
import { RagTestResult } from "@/features/rag/components/RagTestResult";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@supportflow/ui/src/components/ui/button";

export const RagTestPage: React.FC = () => {
  const { testQuery, isTesting, result, error, reset } = useRag();

  const handleSearch = (question: string) => {
    testQuery(question);
  };

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Sparkles className="h-6 w-6 text-primary" />
            RAG Tester & Debugger
          </h1>
          <p className="text-sm text-muted-foreground">
            Thử nghiệm tìm kiếm ngữ cảnh và khả năng trả lời của AI từ dữ liệu
            Knowledge Base.
          </p>
        </div>
        {result && (
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Làm mới
          </Button>
        )}
      </div>

      {/* Form nhập liệu */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <RagTestForm onSubmit={handleSearch} isLoading={isTesting} />
      </div>

      {/* Khu vực kết quả */}
      <RagTestResult result={result} error={error} />
    </div>
  );
};

export default RagTestPage;
