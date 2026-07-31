import { Router } from "express";
import { workspaceController } from "@/modules/workspace/controllers/workspace.controller";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middlewares/auth.middleware";

const router = Router();

/**
 * 1. Public Endpoint
 * Khách hàng truy cập website tích hợp Widget Chat không cần đăng nhập
 */
router.get(
  "/:workspaceId/public-widget",
  workspaceController.getPublicWidgetConfig,
);

/**
 * 2. Protected Endpoints (Yêu cầu đăng nhập JWT)
 */
router.use(authMiddleware);

// Lấy thông tin Workspace của Admin/Agent hiện tại
router.get("/current", workspaceController.getCurrentWorkspace);

// Cập nhật Workspace (Chỉ Owner và Admin mới có quyền)
router.patch(
  "/current",
  requireRole(["owner", "admin"]),
  workspaceController.updateCurrentWorkspace,
);

export const workspaceRoutes = router;
