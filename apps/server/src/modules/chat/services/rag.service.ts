import {
  getGoogleAI,
  getQdrantClient,
  validateAiConfig,
  VECTOR_COLLECTION_NAME,
} from "@/shared/config/ai.config";
import { AppError } from "@/shared/utils/app-error";
import {
  buildSupportSystemPrompt,
  RAG_FALLBACK_PHRASE,
} from "@/modules/chat/prompts/support.prompt";

const TOP_K_CHUNKS = 4;

export interface Citation {
  documentId: string;
  content: string;
  score: number;
}

export interface RAGQueryResult {
  answer: string;
  confidenceScore: number;
  shouldHandoff: boolean;
  citations: Citation[];
}

async function callGeminiWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 3000,
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("Quota exceeded")) {
      console.error(
        "⚠️ Đã chạm giới hạn Quota Free Tier của Google (5 req/phút). Hủy Retry.",
      );
      throw error;
    }

    if (
      retries > 0 &&
      (error.status === 503 || error.message?.includes("high demand"))
    ) {
      console.warn(
        `[Gemini API] Server bận (503). Đang thử lại sau ${delayMs / 1000}s... (Còn ${retries} lần)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return callGeminiWithRetry(fn, retries - 1, delayMs * 2);
    }

    throw error;
  }
}

export class RAGService {
  async queryKnowledgeBase(
    workspaceId: string,
    question: string,
  ): Promise<RAGQueryResult> {
    try {
      validateAiConfig();
      const clientAI = getGoogleAI();

      // 1. Tạo Vector Embedding cho câu hỏi
      const embeddingResponse = await clientAI.models.embedContent({
        model: "gemini-embedding-2",
        contents: question,
      });

      const queryVector = embeddingResponse.embeddings?.[0]?.values;
      if (!queryVector) {
        throw new AppError("Không thể tạo vector embedding cho câu hỏi.", 500);
      }

      // Log kiểm tra số chiều của Vector câu hỏi
      console.log(`[RAG Debug] Query Vector Dimension: ${queryVector.length}`);

      // 2. Tìm kiếm trong Qdrant (Bọc try-catch phòng trường hợp Collection chưa tồn tại)
      const qdrant = getQdrantClient();
      let searchResult: any[] = [];

      // Ép kiểu string chuẩn xác cho workspaceId
      const cleanWorkspaceId = String(workspaceId);

      try {
        searchResult = await qdrant.search(VECTOR_COLLECTION_NAME, {
          vector: queryVector,
          limit: TOP_K_CHUNKS,
          filter: {
            must: [
              {
                key: "workspaceId",
                match: { value: cleanWorkspaceId }, // 👈 Đảm bảo value luôn là string
              },
            ],
          },
        });
      } catch (qdrantErr: any) {
        // In chi tiết phản hồi lỗi từ Qdrant để debug chính xác
        console.error(
          `[Qdrant Search Error Detail]:`,
          qdrantErr?.response?.data || qdrantErr?.data || qdrantErr,
        );
      }

      const topScore = searchResult.length > 0 ? searchResult[0].score : 0;
      const citations: Citation[] = searchResult.map((hit) => ({
        documentId: hit.payload?.documentId as string,
        content: hit.payload?.content as string,
        score: hit.score,
      }));

      // 3. Chuẩn bị Context
      const contextText =
        citations.length > 0
          ? citations
              .map((c, index) => `[Tài liệu ${index + 1}]: ${c.content}`)
              .join("\n\n")
          : "Không có tài liệu nào phù hợp trong hệ thống.";

      // 4. Lấy System Prompt dùng chung
      const systemInstruction = buildSupportSystemPrompt({
        context: contextText,
      });

      // 5. Gọi Gemini Model (SỬA LẠI THÀNH "gemini-2.0-flash")
      const response = await callGeminiWithRetry(() =>
        clientAI.models.generateContent({
          model: "gemini-3.5-flash", // 👈 Sửa từ "gemini-3.5-flash" thành "gemini-2.0-flash"
          contents: [
            {
              role: "user",
              parts: [{ text: `CÂU HỎI CỦA KHÁCH HÀNG:\n"${question}"` }],
            },
          ],
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        }),
      );

      const answerText = response.text || "Không thể khởi tạo câu trả lời.";

      console.log(
        `[RAGService] Question: "${question}" | Answer: "${answerText}" | Top Score: ${topScore} | Citations Found: ${citations.length}`,
      );

      // 6. QUYẾT ĐỊNH HANDOFF
      const shouldHandoff = answerText.includes(RAG_FALLBACK_PHRASE);

      return {
        answer: answerText,
        confidenceScore: topScore,
        shouldHandoff,
        citations,
      };
    } catch (error: any) {
      console.error(
        "[RAG Error Detail]:",
        error?.response?.data || error?.message || error,
      );
      if (error instanceof AppError) throw error;
      throw new AppError(`Lỗi xử lý RAG: ${error.message}`, 500);
    }
  }
}

export const ragService = new RAGService();
