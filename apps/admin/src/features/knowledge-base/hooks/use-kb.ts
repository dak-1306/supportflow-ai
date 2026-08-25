import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kbApi } from "@/features/knowledge-base/services/kb.api";
import { useAuthStore } from "@/stores/auth.store";
import { KB_CONFIG, KB_UI_TEXT } from "../constants/kb.constants";
import { DOCUMENT_STATUS } from "@supportflow/shared-types";
import { toast } from "sonner";

export const kbKeys = {
  all: ["knowledge-base"] as const,
  lists: (workspaceId: string) => [...kbKeys.all, workspaceId] as const,
  list: (workspaceId: string, page: number, limit: number) =>
    [...kbKeys.lists(workspaceId), { page, limit }] as const,
};

export const useKb = (page: number = 1, limit: number = 10) => {
  const queryClient = useQueryClient();
  const workspaceId = useAuthStore((state) => state.user?.workspaceId) || "";

  const documentsQuery = useQuery({
    queryKey: kbKeys.list(workspaceId, page, limit),
    queryFn: () => kbApi.getDocuments(workspaceId, page, limit),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      const hasProcessingFile = query.state.data?.docs.some(
        (doc) => doc.status === DOCUMENT_STATUS.PROCESSING,
      );
      return hasProcessingFile ? KB_CONFIG.POLLING_INTERVAL_MS : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!workspaceId) throw new Error("Không tìm thấy thông tin Workspace");
      return kbApi.uploadDocument(workspaceId, file);
    },
    onSuccess: () => {
      toast.success(KB_UI_TEXT.toast.uploadSuccess, {
        description: KB_UI_TEXT.toast.uploadSuccessDesc,
      });
      queryClient.invalidateQueries({
        queryKey: kbKeys.lists(workspaceId),
      });
    },
    onError: (error: Error) => {
      toast.error("Lỗi tải lên tài liệu", {
        description: error.message || "Không thể tải lên tài liệu.",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => {
      if (!workspaceId) throw new Error("Không tìm thấy thông tin Workspace");
      return kbApi.deleteDocument(workspaceId, documentId);
    },
    onSuccess: () => {
      toast.success(KB_UI_TEXT.toast.deleteSuccess, {
        description: KB_UI_TEXT.toast.deleteSuccessDesc,
      });
      queryClient.invalidateQueries({
        queryKey: kbKeys.lists(workspaceId),
      });
    },
    onError: (error: Error) => {
      toast.error("Lỗi xóa tài liệu", {
        description: error.message || "Không thể xóa tài liệu.",
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
