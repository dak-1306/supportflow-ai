import { ConversationRepository } from "../repositories/conversation.repository";
import { MessageRepository } from "../repositories/message.repository";
import { AppError } from "../../../utils/app-error"; // Giả định dự án đã có file AppError ở M1
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

// Định nghĩa Zod Validation Schema
export const InitChatSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  workspaceId: z.string(), // MVP dùng chung 1 workspaceId cố định hệ thống cấu hình sẵn
});

export const CreateMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000),
});

export class ChatService {
  private conversationRepo = new ConversationRepository();
  private messageRepo = new MessageRepository();

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

  async saveCustomerMessage(conversationId: string, messageText: string) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    // Tạo tin nhắn mới từ khách hàng
    const message = await this.messageRepo.create({
      conversationId: conversation._id,
      sender: "CUSTOMER",
      message: messageText,
      type: "TEXT",
    });

    // Cập nhật trường updatedAt của Conversation để nhảy lên đầu danh sách quản trị
    conversation.updatedAt = new Date();
    await conversation.save();

    return message;
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
}
