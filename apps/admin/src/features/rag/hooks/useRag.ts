import { useMutation } from "@tanstack/react-query";
import { ragApi, RAGQueryResult } from "../services/rag.api";
import { useAuthStore } from "@/stores/auth.store";

export const useRag = () => {
  const { user } = useAuthStore();
  const workspaceId = user?.workspaceId || "";

  const testQueryMutation = useMutation<RAGQueryResult, Error, string>({
    mutationFn: (question: string) => {
      if (!workspaceId) throw new Error("Không tìm thấy thông tin Workspace");
      return ragApi.testQuery({ workspaceId, question });
    },
  });

  return {
    testQuery: testQueryMutation.mutateAsync,
    isTesting: testQueryMutation.isPending,
    result: testQueryMutation.data,
    error: testQueryMutation.error,
    reset: testQueryMutation.reset,
  };
};
