import { GoogleGenAI } from "@google/genai";
import { AppError } from "@/shared/utils/app-error";

export const AI_MODELS = {
  CHAT: process.env.GEMINI_MODEL || "gemini-3.5-flash",
  EMBEDDING: "gemini-embedding-2",
} as const;

export const validateAiConfig = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError("GEMINI_API_KEY chưa được cấu hình trong (.env)", 500);
  }
};

export const getGoogleAI = () => {
  validateAiConfig();
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
  });
};
