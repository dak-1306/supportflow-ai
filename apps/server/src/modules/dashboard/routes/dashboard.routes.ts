import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import {
  authMiddleware,
  requireRole,
} from "../../../shared/middlewares/auth.middleware";

const router = Router();

// Xem báo cáo Analytics dành cho Owner và Admin
router.get(
  "/workspaces/:workspaceId/analytics",
  authMiddleware,
  requireRole(["owner", "admin"]),
  DashboardController.getAnalytics,
);

export default router;
