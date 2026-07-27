import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { sendSuccess } from "../../../utils/api-response";
import { AppError } from "../../../utils/app-error";

export class DashboardController {
  static async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId) {
        throw new AppError("Workspace ID is required", 400);
      }

      const analyticsData = await DashboardService.getAnalytics(workspaceId);

      return sendSuccess(
        res,
        analyticsData,
        "Analytics data retrieved successfully",
      );
    } catch (error) {
      // Đẩy lỗi sang Global Error Middleware xử lý
      next(error);
    }
  }
}
