import {
  getGoogleAI,
  qdrantClient,
  validateAiConfig,
  VECTOR_COLLECTION_NAME,
} from "../../../config/ai.config";
import { AppError } from "../../../utils/app-error";
import {
  buildSupportSystemPrompt,
  RAG_FALLBACK_PHRASE,
} from "../prompts/support.prompt";

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

export class RAGService {
  async queryKnowledgeBase(
    workspaceId: string,
    question: string,
  ): Promise<RAGQueryResult> {
    try {
      validateAiConfig();
      const clientAI = getGoogleAI();

      // 1. Tạo Vector Embedding
      const embeddingResponse = await clientAI.models.embedContent({
        model: "gemini-embedding-2",
        contents: question,
      });

      const queryVector = embeddingResponse.embeddings?.[0]?.values;
      if (!queryVector) {
        throw new AppError("Không thể tạo vector embedding cho câu hỏi.", 500);
      }

      // 2. Tìm kiếm trong Qdrant
      const searchResult = await qdrantClient.search(VECTOR_COLLECTION_NAME, {
        vector: queryVector,
        limit: TOP_K_CHUNKS,
        filter: {
          must: [{ key: "workspaceId", match: { value: workspaceId } }],
        },
      });

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

      // 5. Gọi Gemini Model
      const response = await clientAI.models.generateContent({
        model: "gemini-3.5-flash",
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
      });

      const answerText = response.text || "Không thể khởi tạo câu trả lời.";

      console.log(
        `[RAGService] Question: "${question}" | Answer: "${answerText}" | Top Score: ${topScore} | Citations Found: ${citations.length}`,
      );

      // 6. QUYẾT ĐỊNH HANDOFF: Chỉ Handoff khi Gemini chính thức phát ra câu lệnh Fallback
      // (Gemini sẽ chủ động chào hỏi nếu nhận diện xã giao mà KHÔNG phát ra câu Fallback này)
      const shouldHandoff = answerText.includes(RAG_FALLBACK_PHRASE);

      return {
        answer: answerText,
        confidenceScore: topScore,
        shouldHandoff,
        citations,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Lỗi xử lý RAG: ${error.message}`, 500);
    }
  }
}

export const ragService = new RAGService();
