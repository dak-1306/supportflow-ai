import { Router } from "express";
import { workspaceController } from "@/modules/workspace/controllers/workspace.controller";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middlewares/auth.middleware";
import { publicWidgetCors } from "@/shared/middlewares/cors.middleware";

const router = Router();

// 🟢 Public Endpoint cho Widget
router.get(
  "/:workspaceId/public-widget",
  publicWidgetCors,
  workspaceController.getPublicWidgetConfig,
);

// 🔴 Protected Endpoints cho Admin
router.use(authMiddleware);
router.get("/current", workspaceController.getCurrentWorkspace);
router.patch(
  "/current",
  requireRole(["owner", "admin"]),
  workspaceController.updateCurrentWorkspace,
);

export const workspaceRoutes = router;
