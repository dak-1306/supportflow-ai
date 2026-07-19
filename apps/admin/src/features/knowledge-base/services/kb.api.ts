import { api } from "../../../services/client";

// Định nghĩa Interface dữ liệu trả về thống nhất từ Server
export interface IDocument {
  _id: string;
  workspaceId: string;
  name: string;
  type: "PDF" | "DOCX";
  size: number;
  status: "PROCESSING" | "READY" | "FAILED";
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GetDocumentsResponse {
  docs: IDocument[];
  total: number;
  page: number;
  pages: number;
}

export const kbApi = {
  uploadDocument: async (
    workspaceId: string,
    file: File,
  ): Promise<IDocument> => {
    const formData = new FormData();
    formData.append("file", file);

    // Khớp hoàn toàn với cấu trúc route /workspaces/:workspaceId/documents
    const response = await api.post(
      `/workspaces/${workspaceId}/documents/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.data;
  },

  getDocuments: async (
    workspaceId: string,
    page: number,
    limit: number = 10,
  ): Promise<GetDocumentsResponse> => {
    const response = await api.get(
      `/workspaces/${workspaceId}/documents`,
      {
        params: { page, limit },
      },
    );
    return response.data.data;
  },

  deleteDocument: async (
    workspaceId: string,
    documentId: string,
  ): Promise<void> => {
    const response = await api.delete(
      `/workspaces/${workspaceId}/documents/${documentId}`,
    );
    return response.data.data;
  },
};
