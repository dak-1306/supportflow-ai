import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { AppError } from "@/shared/utils/app-error";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async () => ({
    folder: "supportflow_uploads",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 800, height: 800, crop: "limit" }],
  }),
});

export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Giới hạn 2MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new AppError("Chỉ chấp nhận file hình ảnh.", 400));
    }
    cb(null, true);
  },
});
