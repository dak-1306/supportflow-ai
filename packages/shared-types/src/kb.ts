// packages/shared-types/src/kb.ts

export type DocumentType = "PDF" | "DOCX";
export type DocumentStatus = "PROCESSING" | "READY" | "FAILED";

// Interface đại diện cho Document Object (Dùng cho cả Frontend & Backend DTO)
export interface IDocument {
  id: string;
  workspaceId: string;
  name: string;
  type: DocumentType;
  size: number;
  status: DocumentStatus;
  chunkCount: number;
  uploadedBy?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Interface đại diện cho Document Chunk Object
export interface IDocumentChunk {
  id: string;
  documentId: string;
  workspaceId: string;
  chunkIndex: number;
  content: string;
  vectorId: string;
  page: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// DTOs cho API Responses & Requests
export interface GetDocumentsResponse {
  docs: IDocument[];
  total: number;
  page: number;
  pages: number;
}
