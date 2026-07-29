import { Router } from "express";
import { ragController } from "../controllers/rag.controller";
import { testRagQuerySchema } from "../validations/rag.validation";
import { validate } from "../../../shared/middlewares/validation.middleware";
import {
  authMiddleware,
  requireRole,
} from "../../../shared/middlewares/auth.middleware";

const router = Router();

// Chỉ Owner và Admin được test thử truy vấn RAG
router.post(
  "/test",
  authMiddleware,
  requireRole(["owner", "admin"]),
  validate(testRagQuerySchema),
  ragController.testQuery,
);

export default router;
