import { api } from "@/services/client";

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

export interface TestRagPayload {
  workspaceId: string;
  question: string;
}

export const ragApi = {
  testQuery: async (payload: TestRagPayload): Promise<RAGQueryResult> => {
    try {
      const response = await api.post("/rag/test", payload);
      return response.data.data;
    } catch (error: any) {
      // Lấy thông báo lỗi chi tiết từ backend nếu có
      const serverMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Lỗi không xác định từ Server RAG";
      throw new Error(serverMessage);
    }
  },
};
