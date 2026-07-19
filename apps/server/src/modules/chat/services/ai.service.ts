import { AppError } from "../../../utils/app-error";
import { getGoogleAI, validateAiConfig } from "../../../config/ai.config";

class PromptBuilder {
  static buildSystemPrompt(companyName: string, context: string): string {
    return `
You are an expert customer support assistant for "${companyName}". 
Your code name is SupportFlow AI.

CRITICAL RULES:
1. You must ONLY answer based on the "KNOWLEDGE BASE" provided below.
2. If the answer cannot be found in the provided "KNOWLEDGE BASE", or if the information is insufficient, you MUST exactly reply with: "Tôi chưa tìm thấy thông tin trong tài liệu. Nhân viên sẽ hỗ trợ bạn."
3. Do not make up facts, do not use external knowledge, and do not speculate. 
4. Keep the tone professional, polite, and helpful. Always reply in Vietnamese.

KNOWLEDGE BASE:
${context}
`.trim();
  }
}

export class AIService {
  private modelName: string;

  constructor() {
    // Model mặc định tối ưu trên SDK mới là gemini-2.5-flash
    this.modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  }

  async generateReply(
    customerMessage: string,
    history: { role: "user" | "model"; text: string }[],
    companyName: string = "SupportFlow AI LLC",
    context: string = "Sản phẩm SupportFlow AI có giá bản MVP là 0đ. Hỗ trợ deploy qua Docker. Thời gian hoàn thành trong 1 tháng.",
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
      // Cú pháp Chat thuần diện mạo mới của SDK @google/genai
      const chat = clientAI.chats.create({
        model: this.modelName,
        config: {
          systemInstruction: PromptBuilder.buildSystemPrompt(
            companyName,
            context,
          ),
          temperature: 0.1,
          maxOutputTokens: 400,
        },
        // Khớp lịch sử chat: SDK mới nhận định dạng vai trò là 'user' và 'model' chuẩn hóa trong parts
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
