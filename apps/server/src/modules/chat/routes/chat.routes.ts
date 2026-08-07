import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middlewares/auth.middleware";
import { publicWidgetCors } from "@/shared/middlewares/cors.middleware";

const router = Router();
const chatController = new ChatController();

// 🟢 Kênh mở cho Widget Customer (Áp dụng publicWidgetCors)
router.post(
  "/customer/conversations/init",
  publicWidgetCors,
  chatController.initConversation,
);
router.get(
  "/customer/conversations/:conversationId/messages",
  publicWidgetCors,
  chatController.getMessages,
);
router.post(
  "/customer/conversations/:conversationId/messages",
  publicWidgetCors,
  chatController.customerSendMessage,
);

// 🔴 Kênh bảo mật cho Admin / Dashboard
const allRoles = requireRole(["owner", "admin", "agent"]);

router.use("/admin", authMiddleware, allRoles);

router.get("/admin/conversations", chatController.adminGetConversations);
router.get(
  "/admin/conversations/:conversationId/messages",
  chatController.getMessages,
);
router.post(
  "/admin/conversations/:conversationId/messages",
  chatController.adminSendMessage,
);
router.patch(
  "/admin/conversations/:conversationId/take-over",
  chatController.takeOver,
);
router.patch(
  "/admin/conversations/:conversationId/assign",
  chatController.assign,
);
router.patch(
  "/admin/conversations/:conversationId/resolve",
  chatController.resolve,
);
router.patch(
  "/admin/conversations/:conversationId/enable-ai",
  chatController.enableAI,
);

export default router;
