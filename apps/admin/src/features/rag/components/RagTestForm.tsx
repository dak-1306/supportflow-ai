import React, { useState } from "react";
import { Button } from "@supportflow/ui/src/components/ui/button";
import { Textarea } from "@supportflow/ui/src/components/ui/textarea";
import { Send, Loader2, Sparkles } from "lucide-react";

interface RagTestFormProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

export const RagTestForm: React.FC<RagTestFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    onSubmit(question.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          placeholder="Nhập câu hỏi thử nghiệm để kiểm tra RAG (ví dụ: Chính sách bảo hành sản phẩm là gì?)..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          className="resize-none pr-12 text-sm focus-visible:ring-primary"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!question.trim() || isLoading}
          className="absolute bottom-3 right-3 h-8 w-8"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Hệ thống sẽ tra cứu trong Vector Database (Qdrant) để tổng hợp câu trả
          lời.
        </span>
      </div>
    </form>
  );
};
