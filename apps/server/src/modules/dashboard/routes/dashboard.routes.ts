import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/workspaces/:workspaceId/analytics",
  authMiddleware,
  DashboardController.getAnalytics,
);

export default router;
