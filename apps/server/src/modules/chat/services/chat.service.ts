import { ConversationRepository } from "@/modules/chat/repositories/conversation.repository";
import { MessageRepository } from "@/modules/chat/repositories/message.repository";
import { ragService } from "@/modules/chat/services/rag.service"; // Nối RAG Service thay thế AI Service thuần
import { AppError } from "@/shared/utils/app-error";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { ConversationStatus } from "@supportflow/shared-types";

export const InitChatSchema = z.object({
  customerId: z.string().uuid().nullable().optional(),
  workspaceId: z.string(),
});

export const CreateMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(5000),
});

export class ChatService {
  private conversationRepo = new ConversationRepository();
  private messageRepo = new MessageRepository();

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
        status: "AI" as ConversationStatus,
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

  // Workflow chính điều phối lưu dữ liệu và kích hoạt AI chạy ngầm
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

    // 🟢 LẤY THÔNG TIN CONVERSATION ĐỂ LẤY WORKSPACE_ID
    const conversation = await this.conversationRepo.findById(conversationId);

    const messageJSON = savedMessage.toJSON
      ? savedMessage.toJSON()
      : savedMessage;
    const formattedMessage = {
      ...messageJSON,
      id: messageJSON.id || messageJSON._id?.toString(),
      conversationStatus: conversation?.status || "AI",
    };

    // 2. Phát tín hiệu realtime cho Widget & Admin đang mở phòng này
    io.to(`room_${conversationId}`).emit("new_message", formattedMessage);

    // 🟢 2.5 BỔ SUNG QUAN TRỌNG: Phát tín hiệu cho TOÀN BỘ ADMIN trong Workspace
    // (Giúp Admin kêu chuông & nhảy Badge thông báo kể cả khi chưa bấm vào xem hội thoại)
    if (conversation?.workspaceId) {
      io.to(`workspace_${conversation.workspaceId.toString()}`).emit(
        "new_message",
        formattedMessage,
      );
    }

    // 3. Tiến trình RAG AI chạy ngầm (Background Job)
    this.triggerAILogicBackground(conversationId, messageText.trim(), io).catch(
      (err) => {
        console.error("❌ Lỗi thực thi RAG AI chạy ngầm:", err);
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

    // Chặn AI nếu cuộc hội thoại thuộc quyền Admin tiếp quản
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

      // GỌI RAG SERVICE
      const workspaceIdStr = conversation.workspaceId.toString();
      const ragResult = await ragService.queryKnowledgeBase(
        workspaceIdStr,
        text,
      );

      // Tắt trạng thái typing
      io.to(`room_${conversationId}`).emit("typing_status", {
        conversationId,
        isTyping: false,
        sender: "AI",
      });

      // Nếu RAG báo điểm tin cậy thấp -> Chuyển trạng thái sang WAITING_ADMIN (Milestone 6)
      if (ragResult.shouldHandoff) {
        await this.updateStatusToWaitingAdmin(conversationId);

        // 1. Bắn thông báo nâng cao cho Admin (Kèm preview tin nhắn khách hàng)
        io.to(`workspace_${workspaceIdStr}`).emit("admin_notification", {
          conversationId,
          type: "WAITING_HANDOFF",
          title: "Cần hỗ trợ gấp!",
          message: `Khách hàng vừa hỏi: "${text.length > 40 ? text.substring(0, 40) + "..." : text}"`,
          createdAt: new Date(),
        });

        // 2. Báo cho Widget & ChatWindow cập nhật UI trạng thái ngay lập tức
        io.to(`room_${conversationId}`).emit("conversation_status_changed", {
          conversationId,
          status: "WAITING_ADMIN",
        });
      }

      // Lưu tin nhắn phản hồi AI kèm metadata trích dẫn
      const aiMsg = await this.saveAIMessage(conversationId, ragResult.answer, {
        citations: ragResult.citations,
        confidenceScore: ragResult.confidenceScore,
        shouldHandoff: ragResult.shouldHandoff,
      });

      const aiMsgJSON = aiMsg.toJSON ? aiMsg.toJSON() : aiMsg;
      const formattedAiMsg = {
        ...aiMsgJSON,
        id: aiMsgJSON.id || aiMsgJSON._id?.toString(),
      };

      // Phát tin nhắn của AI cho Widget và Admin Dashboard
      io.to(`room_${conversationId}`).emit("new_message", formattedAiMsg);
    } catch (error) {
      // Đảm bảo luôn tắt typing indicator cho client khi gặp lỗi
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

    // 🟢 BỔ SUNG: Nếu đang ở WAITING_ADMIN hoặc AI, tự động chuyển sang HUMAN và gán adminId
    if (
      conversation.status === ("WAITING_ADMIN" as ConversationStatus) ||
      conversation.status === ("AI" as ConversationStatus)
    ) {
      conversation.status = "HUMAN" as ConversationStatus;
      conversation.assignedAdminId = adminId as any;
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

  async saveAIMessage(
    conversationId: string,
    messageText: string,
    metadata?: Record<string, any>,
  ) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    const message = await this.messageRepo.create({
      conversationId: conversation._id,
      sender: "AI",
      message: messageText,
      type: "TEXT",
      metadata,
    });

    conversation.updatedAt = new Date();
    await conversation.save();

    return message;
  }

  async updateStatusToWaitingAdmin(conversationId: string) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) return null;

    conversation.status = "WAITING_ADMIN" as any;
    conversation.updatedAt = new Date();
    return conversation.save();
  }

  // 1. Admin Tiếp Quản (Take Over)
  async takeOverConversation(conversationId: string, adminId: string, io: any) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    // Cập nhật Status -> HUMAN, gán Admin ID
    const updated = await this.conversationRepo.updateHandoffStatus(
      conversationId,
      "HUMAN",
      adminId,
    );

    // Tạo System Message ghi nhận việc tiếp quản
    const systemMsg = await this.messageRepo.create({
      conversationId: conversation._id,
      sender: "ADMIN",
      message: "Tư vấn viên đã tham gia cuộc hội thoại.",
      type: "SYSTEM",
    });

    // Bắn tín hiệu Realtime cho cả Client Widget và Admin Dashboard
    io.to(`room_${conversationId}`).emit("conversation_status_changed", {
      conversationId,
      status: "HUMAN",
      assignedAdminId: adminId,
    });
    io.to(`room_${conversationId}`).emit("new_message", systemMsg);

    return updated;
  }

  // 2. Chuyển cuộc hội thoại cho Admin khác (Assign)
  async assignConversation(
    conversationId: string,
    targetAdminId: string,
    io: any,
  ) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    const updated = await this.conversationRepo.updateHandoffStatus(
      conversationId,
      conversation.status,
      targetAdminId,
    );

    io.to(`room_${conversationId}`).emit("conversation_assigned", {
      conversationId,
      assignedAdminId: targetAdminId,
    });

    return updated;
  }

  // 3. Hoàn thành cuộc hội thoại (Resolve)
  async resolveConversation(conversationId: string, io: any) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    const updated = await this.conversationRepo.updateHandoffStatus(
      conversationId,
      "RESOLVED",
    );

    const systemMsg = await this.messageRepo.create({
      conversationId: conversation._id,
      sender: "ADMIN",
      message: "Cuộc hội thoại đã được đóng.",
      type: "SYSTEM",
    });

    io.to(`room_${conversationId}`).emit("conversation_status_changed", {
      conversationId,
      status: "RESOLVED",
    });
    io.to(`room_${conversationId}`).emit("new_message", systemMsg);

    return updated;
  }

  // 4. Bật lại Bot AI (Cho phép AI trả lời lại)
  async enableAI(conversationId: string, io: any) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    const updated = await this.conversationRepo.updateHandoffStatus(
      conversationId,
      "AI",
      null,
    );

    io.to(`room_${conversationId}`).emit("conversation_status_changed", {
      conversationId,
      status: "AI",
      assignedAdminId: null,
    });

    return updated;
  }
}
