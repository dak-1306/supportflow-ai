import { Request, Response, NextFunction } from "express";
import { workspaceService } from "@/modules/workspace/services/workspace.service";
import { sendSuccess } from "@/shared/utils/api-response";

export class WorkspaceController {
  /**
   * GET /api/v1/workspaces/current
   * Lấy thông tin Workspace của User hiện tại đang đăng nhập
   */
  async getCurrentWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      // workspaceId được gắn tự động từ authMiddleware qua req.user
      const workspaceId = req.user!.workspaceId;
      const workspace = await workspaceService.getWorkspaceById(workspaceId);

      return sendSuccess(res, workspace, "Lấy thông tin Workspace thành công.");
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/v1/workspaces/current
   * Cập nhật cấu hình Workspace (Cần quyền Owner / Admin)
   */
  async updateCurrentWorkspace(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const workspaceId = req.user!.workspaceId;
      const updateData = req.body;

      const updatedWorkspace = await workspaceService.updateWorkspace(
        workspaceId,
        updateData,
      );

      return sendSuccess(
        res,
        updatedWorkspace,
        "Cập nhật cấu hình Workspace thành công.",
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/workspaces/:workspaceId/public-widget
   * Endpoint CÔNG KHAI dành cho Chat Widget trên Website tích hợp
   */
  async getPublicWidgetConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const { workspaceId } = req.params;
      console.log(
        `[WorkspaceController] Lấy cấu hình Widget công khai cho workspaceId: ${workspaceId}`,
      );
      const widgetConfig =
        await workspaceService.getPublicWidgetConfig(workspaceId);

      return sendSuccess(
        res,
        widgetConfig,
        "Lấy cấu hình Widget công khai thành công.",
      );
    } catch (error) {
      next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();
