// src/config/ai.config.ts
import { GoogleGenAI } from "@google/genai";
import { QdrantClient } from "@qdrant/js-client-rest";
import { AppError } from "@/shared/utils/app-error";

// 1. Chuyển sang sử dụng một hàm getter để khởi tạo instance muộn (Lazy Load)
export const getGoogleAI = () => {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });
};

// QdrantClient có thể giữ nguyên vì nó nhận url động hoặc bạn có thể bọc tương tự nếu cần
export const getQdrantClient = () => {
  const url = process.env.QDRANT_URL;
  const apiKey = process.env.QDRANT_API_KEY;

  if (!url) {
    throw new AppError("QDRANT_URL chưa được cấu hình trong .env", 500);
  }

  return new QdrantClient({
    url: url,
    apiKey: apiKey || undefined,
  });
};

export const VECTOR_COLLECTION_NAME = "supportflow_knowledge_base";
export const VECTOR_SIZE = 3072;

export const validateAiConfig = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError(
      "GEMINI_API_KEY chưa được cấu hình trong biến môi trường (.env).",
      500,
    );
  }
};
