// src/features/knowledge-base/services/kb.api.ts
import { api } from "@/shared/services/client";
import { IDocument, GetDocumentsResponse } from "@supportflow/shared-types";

export const kbApi = {
  uploadDocument: async (
    workspaceId: string,
    file: File,
  ): Promise<IDocument> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post(
      `/workspaces/${workspaceId}/documents/upload`,
      formData,
      {
        headers: { "Content-Type": undefined },
      },
    );
    return response;
  },

  getDocuments: async (
    workspaceId: string,
    page: number,
    limit: number = 10,
  ): Promise<GetDocumentsResponse> => {
    const response = await api.get(`/workspaces/${workspaceId}/documents`, {
      params: { page, limit },
    });
    return response;
  },

  deleteDocument: async (
    workspaceId: string,
    documentId: string,
  ): Promise<void> => {
    const response = await api.delete(
      `/workspaces/${workspaceId}/documents/${documentId}`,
    );
    return response;
  },
};
