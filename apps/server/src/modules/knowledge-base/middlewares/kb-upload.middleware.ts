import multer from "multer";
import { AppError } from "@/shared/utils/app-error";

const KB_MAX_FILE_SIZE_MB = 10;
const KB_ALLOWED_EXTENSIONS = ["pdf", "docx"];

export const kbDocumentUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: KB_MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase();

    if (ext && KB_ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(null, true);
    }

    cb(
      new AppError(
        `Định dạng file không hỗ trợ. Chỉ chấp nhận: ${KB_ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(", ")}`,
        400,
      ),
    );
  },
});
