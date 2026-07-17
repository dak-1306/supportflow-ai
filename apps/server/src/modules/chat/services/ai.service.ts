import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../../../utils/app-error";

// 1. Tách biệt hoàn toàn Prompt Builder sang một Helper kín
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

// 2. Core Service được bảo vệ bởi các bộ lọc ngăn spam
export class AIService {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor() {
    // Không ném lỗi ở đây nữa để tránh làm sập server khi import module
    this.modelName = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  }

  // Hàm helper tự động kiểm tra và cấu hình khi cần dùng
  private initGAI() {
    if (this.genAI) return this.genAI;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new AppError(
        "GEMINI_API_KEY is not defined in environment variables. Hãy kiểm tra lại file .env.",
        500,
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    return this.genAI;
  }

  async generateReply(
    customerMessage: string,
    history: { role: "user" | "model"; text: string }[],
    companyName: string = "SupportFlow AI LLC",
    mockContext: string = "Sản phẩm SupportFlow AI có giá bản MVP là 0đ. Hỗ trợ deploy qua Docker. Thời gian hoàn thành trong 1 tháng.",
  ): Promise<string> {
    // Kích hoạt nạp API Key an toàn tại runtime
    const clientAI = this.initGAI();

    // BỘ LỌC CHẶN SPAM TẦNG NHẬP LIỆU...
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
      const model = clientAI.getGenerativeModel({
        model: this.modelName,
        systemInstruction: PromptBuilder.buildSystemPrompt(
          companyName,
          mockContext,
        ),
      });

      // Toàn bộ logic chat bên dưới giữ nguyên...
      const chat = model.startChat({
        history: history.map((h) => ({
          role: h.role,
          parts: [{ text: h.text }],
        })),
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 400,
        },
      });

      const result = await chat.sendMessage(sanitizedMessage);
      const responseText = result.response.text();

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
