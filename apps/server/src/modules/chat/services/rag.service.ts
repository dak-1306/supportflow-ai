import { AI_MODELS, getGoogleAI } from "@/shared/config/ai.config";
import { QDRANT_CONFIG, getQdrantClient } from "@/shared/config/qdrant.config";
import { AppError } from "@/shared/utils/app-error";
import {
  buildSupportSystemPrompt,
  RAG_FALLBACK_PHRASE,
} from "@/modules/chat/prompts/support.prompt";
import { RAG_CONFIG } from "@/modules/chat/constants/rag.constants";

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
  retries: number = RAG_CONFIG.MAX_RETRIES, // 👈 Thêm : number
  delayMs: number = RAG_CONFIG.RETRY_DELAY_MS, // 👈 Thêm : number
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error.status === 429 || error.message?.includes("Quota exceeded")) {
      console.error(
        "⚠️ Đã chạm giới hạn Quota Free Tier của Google. Hủy Retry.",
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
      const clientAI = getGoogleAI();

      // 1. Tạo Vector Embedding dùng AI_MODELS.EMBEDDING
      const embeddingResponse = await clientAI.models.embedContent({
        model: AI_MODELS.EMBEDDING,
        contents: question,
      });

      const queryVector = embeddingResponse.embeddings?.[0]?.values;
      if (!queryVector) {
        throw new AppError("Không thể tạo vector embedding cho câu hỏi.", 500);
      }

      // 2. Tìm kiếm trong Qdrant bằng QDRANT_CONFIG
      const qdrant = getQdrantClient();
      let searchResult: any[] = [];
      const cleanWorkspaceId = String(workspaceId);

      try {
        searchResult = await qdrant.search(QDRANT_CONFIG.COLLECTION_NAME, {
          vector: queryVector,
          limit: RAG_CONFIG.TOP_K_CHUNKS,
          filter: {
            must: [
              {
                key: "workspaceId",
                match: { value: cleanWorkspaceId },
              },
            ],
          },
        });
      } catch (qdrantErr: any) {
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

      // 5. Gọi Gemini Model dùng AI_MODELS.CHAT
      const response = await callGeminiWithRetry(() =>
        clientAI.models.generateContent({
          model: AI_MODELS.CHAT,
          contents: [
            {
              role: "user",
              parts: [{ text: `CÂU HỎI CỦA KHÁCH HÀNG:\n"${question}"` }],
            },
          ],
          config: {
            systemInstruction,
            temperature: RAG_CONFIG.TEMPERATURE,
          },
        }),
      );

      const answerText = response.text || "Không thể khởi tạo câu trả lời.";

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
