import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import { AIService } from "./ai.service"; // Import AIService
import { AppError } from "../../../utils/app-error";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

export const InitChatSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  workspaceId: z.string(),
});

export const CreateMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000),
});

export class ChatService {
  // Ép kiểu public hoặc tạo getter nếu cần truy cập từ bên ngoài, tuy nhiên ta đã đóng gói logic vào đây nên không cần (any) nữa
  private conversationRepo = new ConversationRepository();
  private messageRepo = new MessageRepository();
  private aiService = new AIService();

  // Khóa chống spam tầng In-memory bảo vệ API Free Tier cho AI
  private activeAIRequests = new Set<string>();

  async initConversation(
    customerId: string | null | undefined,
    workspaceId: string,
  ) {
    let conversation = null;
    let isNew = false;
    let finalCustomerId = customerId;

    if (finalCustomerId) {
      conversation =
        await this.conversationRepo.findActiveByCustomerId(finalCustomerId);
    } else {
      finalCustomerId = uuidv4();
    }

    if (!conversation) {
      conversation = await this.conversationRepo.create({
        workspaceId: workspaceId as any,
        customerId: finalCustomerId,
        status: "AI",
        startedAt: new Date(),
      });
      isNew = true;
    }

    return { conversation, isNew, customerId: finalCustomerId };
  }

  async getMessages(conversationId: string, page: number, limit: number) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }
    return this.messageRepo.findByConversationId(conversationId, page, limit);
  }

  // Phương thức Workflow chính điều phối lưu dữ liệu và kích hoạt AI chạy ngầm
  async handleCustomerMessageWorkflow(
    conversationId: string,
    messageText: string,
    io: any,
  ) {
    // 1. Lưu tin nhắn của khách hàng vào Database
    const savedMessage = await this.saveCustomerMessage(
      conversationId,
      messageText,
    );

    // Định dạng cấu trúc JSON chuẩn chuyển ra ngoài
    const messageJSON = savedMessage.toJSON
      ? savedMessage.toJSON()
      : savedMessage;
    const formattedMessage = {
      ...messageJSON,
      id: messageJSON.id || messageJSON._id?.toString(),
    };

    // 2. Phát tín hiệu realtime ngay cho các Client đang kết nối (Admin Dashboard)
    io.to(`room_${conversationId}`).emit("new_message", formattedMessage);

    // 3. Tách tiến trình gọi AI xử lý bất đồng bộ (Background Job) - Không await để giải phóng HTTP Response
    this.triggerAILogicBackground(conversationId, messageText.trim(), io).catch(
      (err) => {
        console.error("❌ Lỗi thực thi AI chạy ngầm:", err);
      },
    );

    return formattedMessage;
  }

  async saveCustomerMessage(conversationId: string, messageText: string) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const message = await this.messageRepo.create({
      conversationId: conversation._id,
      sender: "CUSTOMER",
      message: messageText,
      type: "TEXT",
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return message;
  }

  private async triggerAILogicBackground(
    conversationId: string,
    text: string,
    io: any,
  ) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) return;

    // Chặn AI nếu trạng thái thuộc quyền Admin tiếp quản
    if (
      conversation.status === "WAITING_ADMIN" ||
      conversation.status === "HUMAN"
    ) {
      return;
    }

    // Chặn trùng lặp request AI vào cùng 1 phòng
    if (this.activeAIRequests.has(conversationId)) return;

    try {
      this.activeAIRequests.add(conversationId);

      // Bật trạng thái typing của AI gửi xuống Widget
      io.to(`room_${conversationId}`).emit("typing_status", {
        conversationId,
        isTyping: true,
        sender: "AI",
      });

      // Lấy lịch sử hội thoại
      const history = await this.getLatestHistoryForAI(conversationId, 6);

      // Gọi API Gemini sinh câu trả lời
      const aiReply = await this.aiService.generateReply(text, history);

      // Tắt trạng thái typing
      io.to(`room_${conversationId}`).emit("typing_status", {
        conversationId,
        isTyping: false,
        sender: "AI",
      });

      // Kiểm tra kịch bản Human Handoff chuyển giao Admin (Rule F03 / F06)
      if (
        aiReply ===
        "Tôi chưa tìm thấy thông tin trong tài liệu. Nhân viên sẽ hỗ trợ bạn."
      ) {
        await this.updateStatusToWaitingAdmin(conversationId);
        io.emit("admin_notification", {
          conversationId,
          type: "waiting_handoff",
        });
      }

      // Lưu tin phản hồi AI vào Database
      const aiMsg = await this.saveAIMessage(conversationId, aiReply);

      const aiMsgJSON = aiMsg.toJSON ? aiMsg.toJSON() : aiMsg;
      const formattedAiMsg = {
        ...aiMsgJSON,
        id: aiMsgJSON.id || aiMsgJSON._id?.toString(),
      };

      // Phát tin nhắn của AI cho Widget và Admin Dashboard
      io.to(`room_${conversationId}`).emit("new_message", formattedAiMsg);
    } catch (error) {
      // Đảm bảo luôn tắt typing indicator cho client khi dính lỗi hệ thống
      io.to(`room_${conversationId}`).emit("typing_status", {
        conversationId,
        isTyping: false,
        sender: "AI",
      });
      throw error;
    } finally {
      this.activeAIRequests.delete(conversationId);
    }
  }

  async saveAdminMessage(
    conversationId: string,
    messageText: string,
    adminId: string,
  ) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const message = await this.messageRepo.create({
      conversationId: conversation._id,
      sender: "ADMIN",
      message: messageText,
      type: "TEXT",
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return message;
  }

  async getAdminConversations(
    workspaceId: string,
    status: string,
    page: number,
    limit: number,
  ) {
    return this.conversationRepo.findByWorkspace(
      workspaceId,
      status,
      page,
      limit,
    );
  }

  async saveAIMessage(conversationId: string, messageText: string) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const message = await this.messageRepo.create({
      conversationId: conversation._id,
      sender: "AI",
      message: messageText,
      type: "TEXT",
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return message;
  }

  async getLatestHistoryForAI(
    conversationId: string,
    limit: number = 6,
  ): Promise<{ role: "user" | "model"; text: string }[]> {
    const result = await this.messageRepo.findByConversationId(
      conversationId,
      1,
      limit,
    );

    const messageList = result?.messages || [];
    const sortedMessages = [...messageList].reverse();

    return sortedMessages
      .filter((msg) => msg.sender === "CUSTOMER" || msg.sender === "AI")
      .map((msg) => ({
        role: msg.sender === "CUSTOMER" ? "user" : "model",
        text: msg.message,
      }));
  }

  async updateStatusToWaitingAdmin(conversationId: string) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) return null;

    conversation.status = "WAITING_ADMIN" as any;
    conversation.updatedAt = new Date();
    return conversation.save();
  }
}
