import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import {
  authMiddleware,
  requireRole,
} from "../../../shared/middlewares/auth.middleware";

const router = Router();
const chatController = new ChatController();

// Kênh mở cho Widget (Customer Public - Không cần Auth)
router.post("/customer/conversations/init", chatController.initConversation);
router.get(
  "/customer/conversations/:conversationId/messages",
  chatController.getMessages,
);
router.post(
  "/customer/conversations/:conversationId/messages",
  chatController.customerSendMessage,
);

// Kênh bảo mật cho App Admin / Dashboard
// Tất cả Owner, Admin, Agent đều có quyền thao tác Chat
const allRoles = requireRole(["owner", "admin", "agent"]);

router.get(
  "/admin/conversations",
  authMiddleware,
  allRoles,
  chatController.adminGetConversations,
);
router.get(
  "/admin/conversations/:conversationId/messages",
  authMiddleware,
  allRoles,
  chatController.getMessages,
);
router.post(
  "/admin/conversations/:conversationId/messages",
  authMiddleware,
  allRoles,
  chatController.adminSendMessage,
);

// Actions cho Human Handoff (Tiếp quản, Gán, Hoàn thành, Bật AI)
router.patch(
  "/admin/conversations/:conversationId/take-over",
  authMiddleware,
  allRoles,
  chatController.takeOver,
);

router.patch(
  "/admin/conversations/:conversationId/assign",
  authMiddleware,
  allRoles,
  chatController.assign,
);

router.patch(
  "/admin/conversations/:conversationId/resolve",
  authMiddleware,
  allRoles,
  chatController.resolve,
);

router.patch(
  "/admin/conversations/:conversationId/enable-ai",
  authMiddleware,
  allRoles,
  chatController.enableAI,
);

export default router;
