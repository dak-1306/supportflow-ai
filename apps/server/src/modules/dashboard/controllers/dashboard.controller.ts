import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";

export class DashboardController {
  static async getAnalytics(req: Request, res: Response) {
    try {
      const { workspaceId } = req.params;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: "Workspace ID is required",
        });
      }

      const analyticsData = await DashboardService.getAnalytics(workspaceId);

      return res.status(200).json({
        success: true,
        data: analyticsData,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
