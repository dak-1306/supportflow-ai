import React from "react";
import { RAGQueryResult } from "@/features/rag/services/rag.api";
import { CitationCard } from "@/features/rag/components/CitationCard";
import { Bot, AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface RagTestResultProps {
  // Chấp nhận cả dữ liệu chuẩn RAGQueryResult hoặc Response bị bọc bởi API
  result: (RAGQueryResult & { data?: RAGQueryResult }) | undefined;
  error: Error | null;
}

export const RagTestResult: React.FC<RagTestResultProps> = ({
  result: rawResult,
  error,
}) => {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-5 w-5" />
          <span>Có lỗi xảy ra khi truy vấn RAG</span>
        </div>
        <p className="mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  if (!rawResult) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center text-muted-foreground">
        <Bot className="mb-2 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm">Chưa có dữ liệu thử nghiệm.</p>
        <p className="text-xs">
          Hãy đặt câu hỏi ở trên để bắt đầu kiểm tra luồng RAG.
        </p>
      </div>
    );
  }

  // 🌟 GIẢI BỌC DỮ LIỆU: Nếu Backend bọc trong `data` thì lấy `rawResult.data`
  const resultData = rawResult.data ? rawResult.data : rawResult;

  // Bóc tách an toàn từ resultData
  const citations = resultData.citations ?? [];
  const confidenceScore = resultData.confidenceScore ?? 0;
  const confidencePercent = (confidenceScore * 100).toFixed(1);
  const answer = resultData.answer || "Không có câu trả lời.";
  const shouldHandoff = resultData.shouldHandoff ?? false;

  return (
    <div className="space-y-6">
      {/* Khối Phản hồi của AI */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">
              Phản hồi từ AI (Gemini)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Trạng thái Confidence Score & Handoff */}
            <div
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                shouldHandoff
                  ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }`}
            >
              {shouldHandoff ? (
                <>
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>
                    Cảnh báo: Tự động chuyển Handoff ({confidencePercent}%)
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Độ tin cậy ({confidencePercent}%)</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-foreground">
          <p className="whitespace-pre-wrap leading-relaxed">{answer}</p>
        </div>
      </div>

      {/* Khối Trích dẫn nguồn (Citations) */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Tài liệu tham khảo được tìm thấy ({citations.length})
        </h4>

        {citations.length === 0 ? (
          <p className="text-xs italic text-muted-foreground">
            Không tìm thấy đoạn văn bản phù hợp nào trong Vector Database.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {citations.map((citation, index) => (
              <CitationCard key={index} citation={citation} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
