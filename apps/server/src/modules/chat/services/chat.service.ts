import { ConversationRepository } from "@/modules/chat/repositories/conversation.repository";
import { MessageRepository } from "@/modules/chat/repositories/message.repository";
import { ragService } from "@/modules/chat/services/rag.service";
import { AppError } from "@/shared/utils/app-error";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  CONVERSATION_STATUS,
  MESSAGE_SENDER,
  MESSAGE_TYPE,
} from "@supportflow/shared-types";
import {
  SOCKET_EVENTS,
  SOCKET_ROOMS,
  SYSTEM_MESSAGES,
} from "@supportflow/shared-types";

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
  private activeAIRequests = new Set<string>();

  // HelperPrivate gom gọn logic serialize JSON cho message
  private formatMessage(message: any, extraFields: Record<string, any> = {}) {
    const json = message?.toJSON ? message.toJSON() : message;
    return {
      ...json,
      id: json.id || json._id?.toString(),
      ...extraFields,
    };
  }

  async initConversation(
    customerId: string | null | undefined,
    workspaceId: string,
  ) {
    let conversation = null;
    let finalCustomerId = customerId;

    if (finalCustomerId) {
      conversation =
        await this.conversationRepo.findActiveByCustomerId(finalCustomerId);
    } else {
      finalCustomerId = uuidv4();
    }

    if (!conversation) {
      conversation = await this.conversationRepo.create({
        workspaceId,
        customerId: finalCustomerId,
        status: CONVERSATION_STATUS.AI,
        startedAt: new Date(),
      });
      return { conversation, isNew: true, customerId: finalCustomerId };
    }

    return { conversation, isNew: false, customerId: finalCustomerId };
  }

  async getMessages(conversationId: string, page: number, limit: number) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    return this.messageRepo.findByConversationId(conversationId, page, limit);
  }

  async handleCustomerMessageWorkflow(
    conversationId: string,
    messageText: string,
    io: any,
  ) {
    const savedMessage = await this.saveCustomerMessage(
      conversationId,
      messageText,
    );
    const conversation = await this.conversationRepo.findById(conversationId);

    const formattedMessage = this.formatMessage(savedMessage, {
      conversationStatus: conversation?.status || CONVERSATION_STATUS.AI,
    });

    // Bắn socket cho Room và Workspace
    io.to(SOCKET_ROOMS.CONVERSATION(conversationId)).emit(
      SOCKET_EVENTS.NEW_MESSAGE,
      formattedMessage,
    );

    if (conversation?.workspaceId) {
      io.to(SOCKET_ROOMS.WORKSPACE(conversation.workspaceId.toString())).emit(
        SOCKET_EVENTS.WORKSPACE_NEW_MESSAGE,
        formattedMessage,
      );
    }

    // AI Workflow Chạy ngầm
    this.triggerAILogicBackground(conversationId, messageText.trim(), io).catch(
      (err) => {
        console.error("❌ Lỗi thực thi RAG AI chạy ngầm:", err);
      },
    );

    return formattedMessage;
  }

  async saveCustomerMessage(conversationId: string, messageText: string) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    const message = await this.messageRepo.create({
      conversationId: conversation.id,
      sender: MESSAGE_SENDER.CUSTOMER,
      message: messageText,
      type: MESSAGE_TYPE.TEXT,
    });

    await this.conversationRepo.update(conversationId, {
      updatedAt: new Date(),
    });
    return message;
  }

  private async triggerAILogicBackground(
    conversationId: string,
    text: string,
    io: any,
  ) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) return;

    if (
      conversation.status === CONVERSATION_STATUS.WAITING_ADMIN ||
      conversation.status === CONVERSATION_STATUS.HUMAN
    ) {
      return;
    }

    if (this.activeAIRequests.has(conversationId)) return;

    const roomName = SOCKET_ROOMS.CONVERSATION(conversationId);

    try {
      this.activeAIRequests.add(conversationId);

      io.to(roomName).emit(SOCKET_EVENTS.TYPING_STATUS, {
        conversationId,
        isTyping: true,
        sender: MESSAGE_SENDER.AI,
      });

      const workspaceIdStr = conversation.workspaceId.toString();
      const ragResult = await ragService.queryKnowledgeBase(
        workspaceIdStr,
        text,
      );

      io.to(roomName).emit(SOCKET_EVENTS.TYPING_STATUS, {
        conversationId,
        isTyping: false,
        sender: MESSAGE_SENDER.AI,
      });

      if (ragResult.shouldHandoff) {
        await this.updateStatusToWaitingAdmin(conversationId);

        io.to(SOCKET_ROOMS.WORKSPACE(workspaceIdStr)).emit(
          SOCKET_EVENTS.ADMIN_NOTIFICATION,
          {
            conversationId,
            type: "WAITING_HANDOFF",
            title: "Cần hỗ trợ gấp!",
            message: `Khách hàng vừa hỏi: "${text.length > 40 ? text.substring(0, 40) + "..." : text}"`,
            createdAt: new Date(),
          },
        );

        io.to(roomName).emit(SOCKET_EVENTS.STATUS_CHANGED, {
          conversationId,
          status: CONVERSATION_STATUS.WAITING_ADMIN,
        });
      }

      const aiMsg = await this.saveAIMessage(conversationId, ragResult.answer, {
        citations: ragResult.citations,
        confidenceScore: ragResult.confidenceScore,
        shouldHandoff: ragResult.shouldHandoff,
      });

      io.to(roomName).emit(
        SOCKET_EVENTS.NEW_MESSAGE,
        this.formatMessage(aiMsg),
      );
    } catch (error) {
      io.to(roomName).emit(SOCKET_EVENTS.TYPING_STATUS, {
        conversationId,
        isTyping: false,
        sender: MESSAGE_SENDER.AI,
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
    io?: any,
  ) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    if (
      conversation.status === CONVERSATION_STATUS.WAITING_ADMIN ||
      conversation.status === CONVERSATION_STATUS.AI
    ) {
      conversation.status = CONVERSATION_STATUS.HUMAN;
      conversation.assignedAdminId = adminId;
    }

    const message = await this.messageRepo.create({
      conversationId: conversation.id,
      sender: MESSAGE_SENDER.ADMIN,
      message: messageText,
      type: MESSAGE_TYPE.TEXT,
    });

    await this.conversationRepo.update(conversationId, {
      updatedAt: new Date(),
    });
    const formattedMessage = this.formatMessage(message);

    if (io) {
      io.to(SOCKET_ROOMS.CONVERSATION(conversationId)).emit(
        SOCKET_EVENTS.NEW_MESSAGE,
        formattedMessage,
      );

      if (conversation.workspaceId) {
        io.to(SOCKET_ROOMS.WORKSPACE(conversation.workspaceId.toString())).emit(
          SOCKET_EVENTS.WORKSPACE_NEW_MESSAGE,
          formattedMessage,
        );
      }
    }

    return formattedMessage;
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
    if (!conversation) throw new AppError("Conversation not found", 404);

    const message = await this.messageRepo.create({
      conversationId: conversation.id,
      sender: MESSAGE_SENDER.AI,
      message: messageText,
      type: MESSAGE_TYPE.TEXT,
      metadata,
    });

    await this.conversationRepo.update(conversationId, {
      updatedAt: new Date(),
    });
    return message;
  }

  async updateStatusToWaitingAdmin(conversationId: string) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) return null;

    await this.conversationRepo.update(conversationId, {
      status: CONVERSATION_STATUS.WAITING_ADMIN,
      updatedAt: new Date(),
    });
  }

  async takeOverConversation(conversationId: string, adminId: string, io: any) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    const updated = await this.conversationRepo.updateHandoffStatus(
      conversationId,
      CONVERSATION_STATUS.HUMAN,
      adminId,
    );

    const systemMsg = await this.messageRepo.create({
      conversationId: conversation.id,
      sender: MESSAGE_SENDER.ADMIN,
      message: SYSTEM_MESSAGES.ADMIN_JOINED,
      type: MESSAGE_TYPE.SYSTEM,
    });

    const roomName = SOCKET_ROOMS.CONVERSATION(conversationId);
    io.to(roomName).emit(SOCKET_EVENTS.STATUS_CHANGED, {
      conversationId,
      status: CONVERSATION_STATUS.HUMAN,
      assignedAdminId: adminId,
    });
    io.to(roomName).emit(
      SOCKET_EVENTS.NEW_MESSAGE,
      this.formatMessage(systemMsg),
    );

    return updated;
  }

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

    io.to(SOCKET_ROOMS.CONVERSATION(conversationId)).emit(
      SOCKET_EVENTS.ASSIGNED,
      {
        conversationId,
        assignedAdminId: targetAdminId,
      },
    );

    return updated;
  }

  async resolveConversation(conversationId: string, io: any) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    const updated = await this.conversationRepo.updateHandoffStatus(
      conversationId,
      CONVERSATION_STATUS.RESOLVED,
    );

    const systemMsg = await this.messageRepo.create({
      conversationId: conversation.id,
      sender: MESSAGE_SENDER.ADMIN,
      message: SYSTEM_MESSAGES.CONVERSATION_CLOSED,
      type: MESSAGE_TYPE.SYSTEM,
    });

    const roomName = SOCKET_ROOMS.CONVERSATION(conversationId);
    io.to(roomName).emit(SOCKET_EVENTS.STATUS_CHANGED, {
      conversationId,
      status: CONVERSATION_STATUS.RESOLVED,
    });
    io.to(roomName).emit(
      SOCKET_EVENTS.NEW_MESSAGE,
      this.formatMessage(systemMsg),
    );

    return updated;
  }

  async enableAI(conversationId: string, io: any) {
    const conversation = await this.conversationRepo.findById(conversationId);
    if (!conversation) throw new AppError("Conversation not found", 404);

    const updated = await this.conversationRepo.updateHandoffStatus(
      conversationId,
      CONVERSATION_STATUS.AI,
      null,
    );

    io.to(SOCKET_ROOMS.CONVERSATION(conversationId)).emit(
      SOCKET_EVENTS.STATUS_CHANGED,
      {
        conversationId,
        status: CONVERSATION_STATUS.AI,
        assignedAdminId: null,
      },
    );

    return updated;
  }
}
