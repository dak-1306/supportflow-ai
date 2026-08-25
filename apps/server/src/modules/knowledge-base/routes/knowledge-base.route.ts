import { Router } from "express";
import { knowledgeBaseController } from "../controllers/knowledge-base.controller";
import { kbDocumentUpload } from "../middlewares/kb-upload.middleware";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middlewares/auth.middleware";

const router = Router({ mergeParams: true });
const adminOnly = requireRole(["owner", "admin"]);

router.post(
  "/upload",
  authMiddleware,
  adminOnly,
  kbDocumentUpload.single("file"),
  knowledgeBaseController.uploadDocument,
);

router.get(
  "/",
  authMiddleware,
  adminOnly,
  knowledgeBaseController.getDocuments,
);

router.delete(
  "/:documentId",
  authMiddleware,
  adminOnly,
  knowledgeBaseController.deleteDocument,
);

export const knowledgeBaseRouter = router;
