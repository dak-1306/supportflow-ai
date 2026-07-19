import { Router } from "express";
import multer from "multer";
import { knowledgeBaseController } from "../controllers/knowledge-base.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { AppError } from "../../../utils/app-error";

const router = Router({ mergeParams: true }); // Giúp lấy được workspaceId từ route cha

// Cấu hình multer lưu tạm file trong Memory dưới dạng Buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Giới hạn tối đa 10MB
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

// Định nghĩa các endpoint chính thức cho Milestone 4
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  knowledgeBaseController.uploadDocument,
);
router.get("/", authMiddleware, knowledgeBaseController.getDocuments);
router.delete(
  "/:documentId",
  authMiddleware,
  knowledgeBaseController.deleteDocument,
);

export const knowledgeBaseRouter = router;
