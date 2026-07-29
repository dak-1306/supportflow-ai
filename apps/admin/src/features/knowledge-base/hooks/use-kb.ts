import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kbApi } from "@/features/knowledge-base/services/kb.api";
import { useAuthStore } from "@/stores/auth.store"; // Đường dẫn tới authStore của bạn

export const useKb = (page: number = 1, limit: number = 10) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  console.log("useKb: user", user);
  const workspaceId = user?.workspaceId || "";

  // Query: Lấy danh sách tài liệu (Chỉ chạy khi có workspaceId)
  const documentsQuery = useQuery({
    queryKey: ["knowledge-base", workspaceId, page, limit],
    queryFn: () => kbApi.getDocuments(workspaceId, page, limit),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      // Tự động polling làm mới danh sách mỗi 4 giây nếu phát hiện có file đang PROCESSING
      const hasProcessingFile = query.state.data?.docs.some(
        (doc) => doc.status === "PROCESSING",
      );
      return hasProcessingFile ? 4000 : false;
    },
  });

  // Mutation: Tải lên tài liệu
  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!workspaceId) throw new Error("Không tìm thấy thông tin Workspace");
      return kbApi.uploadDocument(workspaceId, file);
    },
    onSuccess: () => {
      // Invalidate cache để tự động reload lại danh sách file
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base", workspaceId],
      });
    },
  });

  // Mutation: Xóa tài liệu
  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => {
      if (!workspaceId) throw new Error("Không tìm thấy thông tin Workspace");
      return kbApi.deleteDocument(workspaceId, documentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge-base", workspaceId],
      });
    },
  });

  return {
    documents: documentsQuery.data?.docs || [],
    pagination: {
      total: documentsQuery.data?.total || 0,
      page: documentsQuery.data?.page || 1,
      pages: documentsQuery.data?.pages || 1,
    },
    isLoading: documentsQuery.isLoading,
    isError: documentsQuery.isError,
    error: documentsQuery.error,

    isUploading: uploadMutation.isPending,
    uploadDocument: uploadMutation.mutateAsync,

    isDeleting: deleteMutation.isPending,
    deleteDocument: deleteMutation.mutateAsync,
  };
};
