import { AppError } from "@/shared/utils/app-error";
import {
  getGoogleAI,
  validateAiConfig,
  AI_MODELS,
} from "@/shared/config/ai.config";
import { buildSupportSystemPrompt } from "@/shared/prompts/support.prompt";

export class AIService {
  private modelName: string;

  constructor() {
    this.modelName = process.env.GEMINI_MODEL || AI_MODELS.CHAT;
  }

  async generateReply(
    customerMessage: string,
    history: { role: "user" | "model"; text: string }[],
    companyName: string = "SupportFlow AI LLC",
    context: string = "Sản phẩm SupportFlow AI có giá bản MVP là 0đ. Hỗ trợ deploy qua Docker.",
  ): Promise<string> {
    validateAiConfig();
    const clientAI = getGoogleAI();

    const sanitizedMessage = customerMessage.trim();
    if (!sanitizedMessage || sanitizedMessage.length < 2) {
      throw new AppError(
        "Tin nhắn quá ngắn hoặc trống, không gửi lên AI.",
        400,
      );
    }
    if (sanitizedMessage.length > 500) {
      throw new AppError(
        "Tin nhắn vượt quá độ dài cho phép (tối đa 500 ký tự).",
        400,
      );
    }

    try {
      const chat = clientAI.chats.create({
        model: this.modelName,
        config: {
          systemInstruction: buildSupportSystemPrompt({ companyName, context }),
          temperature: 0.1,
          maxOutputTokens: 400,
        },
        history: history.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
      });

      const result = await chat.sendMessage({ message: sanitizedMessage });
      const responseText = result.text;

      if (!responseText) {
        throw new AppError("AI generated an empty response", 500);
      }

      return responseText;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new AppError(
        `AI Service Error: ${error.message || "Unknown error"}`,
        500,
      );
    }
  }
}
