import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware"; // Kế thừa từ M1

const router = Router();
const chatController = new ChatController();

// Kênh mở cho Widget (Customer Public)
router.post("/customer/conversations/init", chatController.initConversation);
router.get(
  "/customer/conversations/:conversationId/messages",
  chatController.getMessages,
);
router.post(
  "/customer/conversations/:conversationId/messages",
  chatController.customerSendMessage,
);

// Kênh bảo mật cho App Admin (JWT Protected)
router.get(
  "/admin/conversations",
  authMiddleware,
  chatController.adminGetConversations,
);
router.get(
  "/admin/conversations/:conversationId/messages",
  authMiddleware,
  chatController.getMessages,
);
router.post(
  "/admin/conversations/:conversationId/messages",
  authMiddleware,
  chatController.adminSendMessage,
);

export default router;
