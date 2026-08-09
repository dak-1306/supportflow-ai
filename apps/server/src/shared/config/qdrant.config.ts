import { QdrantClient } from "@qdrant/js-client-rest";
import { AppError } from "@/shared/utils/app-error";

export const QDRANT_CONFIG = {
  COLLECTION_NAME: "supportflow_knowledge_base",
  VECTOR_SIZE: 3072,
} as const;

export const validateQdrantConfig = () => {
  if (!process.env.QDRANT_URL) {
    throw new AppError("QDRANT_URL chưa được cấu hình trong (.env)", 500);
  }
};

export const getQdrantClient = () => {
  validateQdrantConfig();
  return new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY || undefined,
  });
};
