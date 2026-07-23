import { Request, Response, NextFunction } from "express";
import { ragService } from "../services/rag.service";
import { sendSuccess } from "../../../utils/api-response";

export class RAGController {
  /**
   * API dành cho Admin thử nghiệm câu hỏi RAG
   * POST /api/v1/rag/test
   */
  async testQuery(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId, question } = req.body;

      const result = await ragService.queryKnowledgeBase(workspaceId, question);

      return sendSuccess(res, {
        message: "Truy vấn RAG thành công",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const ragController = new RAGController();
