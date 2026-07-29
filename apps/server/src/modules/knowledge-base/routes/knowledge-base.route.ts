import { Router } from "express";
import multer from "multer";
import { knowledgeBaseController } from "../controllers/knowledge-base.controller";
import {
  authMiddleware,
  requireRole,
} from "../../../shared/middlewares/auth.middleware";
import { AppError } from "../../../shared/utils/app-error";

const router = Router({ mergeParams: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase();
    if (ext === "pdf" || ext === "docx") {
      return cb(null, true);
    }
    cb(
      new AppError("Chỉ hỗ trợ định dạng file .pdf và .docx", 400) as any,
      false,
    );
  },
});

// Quyền quản lý Knowledge Base (Chỉ Owner & Admin)
const adminOnly = requireRole(["owner", "admin"]);

router.post(
  "/upload",
  authMiddleware,
  adminOnly,
  upload.single("file"),
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
