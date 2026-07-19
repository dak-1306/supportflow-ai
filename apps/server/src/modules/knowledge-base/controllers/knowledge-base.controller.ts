import { Request, Response, NextFunction } from "express";
import { knowledgeBaseService } from "../services/knowledge-base.service";
import { AppError } from "../../../utils/app-error";
import { sendSuccess } from "../../../utils/api-response"; // Sử dụng util của bạn

export class KnowledgeBaseController {
  async uploadDocument(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const file = req.file;

      if (!file) {
        throw new AppError("Vui lòng cung cấp file tài liệu hợp lệ.", 400);
      }

      const doc = await knowledgeBaseService.handleUpload(workspaceId, {
        originalname: file.originalname,
        buffer: file.buffer,
        size: file.size,
      });

      // Sử dụng .id thay vì ._id và dùng sendSuccess
      sendSuccess(
        res,
        {
          id: doc.id,
          name: doc.name,
          status: doc.status,
        },
        "Tài liệu đã được tải lên và đang trong quá trình xử lý.",
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async getDocuments(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await knowledgeBaseService.getDocuments(
        workspaceId,
        page,
        limit,
      );

      sendSuccess(res, result, "Lấy danh sách tài liệu thành công.", 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteDocument(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { workspaceId, documentId } = req.params;

      await knowledgeBaseService.deleteDocument(workspaceId, documentId);

      sendSuccess(
        res,
        { id: documentId },
        "Tài liệu và dữ liệu vector liên quan đã được xóa thành công.",
        200,
      );
    } catch (error) {
      next(error);
    }
  }
}

export const knowledgeBaseController = new KnowledgeBaseController();
