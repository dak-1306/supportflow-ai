import { Request, Response, NextFunction } from "express";
import {
  ChatService,
  InitChatSchema,
  CreateMessageSchema,
} from "../services/chat.service";
import { sendSuccess } from "../../../utils/api-response";

export class ChatController {
  private chatService = new ChatService();

  initConversation = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const validatedBody = InitChatSchema.parse(req.body);
      const result = await this.chatService.initConversation(
        validatedBody.customerId,
        validatedBody.workspaceId,
      );

      return sendSuccess(
        res,
        result,
        "Conversation initialized successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  };

  getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { conversationId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await this.chatService.getMessages(
        conversationId,
        page,
        limit,
      );

      return sendSuccess(res, result, "Messages retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  };

  customerSendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { conversationId } = req.params;
      const { message } = CreateMessageSchema.parse(req.body);

      // Lấy instance socket io từ context của Express app
      const io = req.app.get("io");

      // Gọi Service xử lý tập trung (lưu DB, phát socket customer message, kích hoạt AI chạy ngầm)
      const formattedMessage =
        await this.chatService.handleCustomerMessageWorkflow(
          conversationId,
          message,
          io,
        );

      // Trả response HTTP về cho Widget ngay lập tức
      return sendSuccess(
        res,
        formattedMessage,
        "Message sent successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  };

  adminGetConversations = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const workspaceId = req.user!.workspaceId;
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await this.chatService.getAdminConversations(
        workspaceId,
        status,
        page,
        limit,
      );

      console.log("Admin retrieved conversations:", result);

      return sendSuccess(
        res,
        result,
        "Conversations retrieved successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  };

  adminSendMessage = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { conversationId } = req.params;
      const adminId = req.user!._id;
      const { message } = CreateMessageSchema.parse(req.body);

      const savedMessage = await this.chatService.saveAdminMessage(
        conversationId,
        message,
        adminId,
      );

      const messageJSON = savedMessage.toJSON
        ? savedMessage.toJSON()
        : savedMessage;
      const formattedMessage = {
        ...messageJSON,
        id: messageJSON.id || messageJSON._id?.toString(),
      };

      const io = req.app.get("io");
      io.to(`room_${conversationId}`).emit("new_message", formattedMessage);

      return sendSuccess(
        res,
        formattedMessage,
        "Admin message sent successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  };
}
