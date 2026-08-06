import { Request, Response, NextFunction } from "express";
import { uploadService } from "../services/upload.service";
import { sendSuccess } from "@/shared/utils/api-response";

export class UploadController {
  /**
   * POST /api/v1/uploads/image
   * Tải lên hình ảnh đơn (Logo, Bot Avatar, Avatar cá nhân)
   */
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await uploadService.processUploadedFile(req.file);

      return sendSuccess(res, result, "Tải lên hình ảnh thành công.");
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
