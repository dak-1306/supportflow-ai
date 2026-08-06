import { AppError } from "@/shared/utils/app-error";

export class UploadService {
  /**
   * Xử lý kết quả file nhận được từ Multer Cloudinary Storage
   */
  async processUploadedFile(
    file?: Express.Multer.File,
  ): Promise<{ url: string }> {
    if (!file) {
      throw new AppError("Vui lòng chọn file hình ảnh để tải lên.", 400);
    }

    // CloudinaryStorage tự động đính kèm URL CDN công khai vào file.path
    return {
      url: file.path,
    };
  }
}

export const uploadService = new UploadService();
