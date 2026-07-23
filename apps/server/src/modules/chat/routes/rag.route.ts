import { Router } from "express";
import { ragController } from "../controllers/rag.controller";
import { testRagQuerySchema } from "../validations/rag.validation";
import { validate } from "../../../middlewares/validation.middleware"; // Thay bằng middleware validate zod của dự án bạn
import { authMiddleware } from "../../../middlewares/auth.middleware"; // Thay bằng auth middleware Admin của dự án bạn

const router = Router();

// Route dành cho Admin test tính năng RAG trực tiếp trên Dashboard
router.post(
  "/test",
  authMiddleware, // Bắt buộc đăng nhập Admin
  validate(testRagQuerySchema),
  ragController.testQuery,
);

export default router;
