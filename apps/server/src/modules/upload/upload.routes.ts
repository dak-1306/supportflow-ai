import { Router, Request, Response, NextFunction } from "express";
import { uploadController } from "./controllers/upload.controller";
import { uploadMiddleware } from "./middlewares/upload.middleware";
import { authMiddleware } from "@/shared/middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

// 🟢 Middleware bọc để bắt và in ra chính xác nguyên nhân crash Cloudinary
const handleMulterUpload = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  uploadMiddleware.single("file")(req, res, (err: any) => {
    if (err) {
      console.error("🔥 LỖI TỪ MULTER / CLOUDINARY:", err);
      return res.status(500).json({
        success: false,
        message: err.message || "Không thể upload ảnh lên Cloudinary",
        detail: err, // Trả lỗi về Network tab để xem
      });
    }
    next();
  });
};

router.post("/image", handleMulterUpload, uploadController.uploadImage);

export const uploadRoutes = router;
