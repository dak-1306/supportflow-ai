import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const router = Router();

// GET /api/workspaces/:workspaceId/analytics
router.get(
  "/workspaces/:workspaceId/analytics",
  DashboardController.getAnalytics,
);

export default router;
