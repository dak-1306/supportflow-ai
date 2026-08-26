import { api } from "@/shared/services/client";

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
    const response = await api.post("/rag/test", payload);
    return response;
  },
};
