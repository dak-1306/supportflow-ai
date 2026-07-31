import { Router } from "express";
import { UserController } from "@/modules/user/controllers/user.controller";
import {
  authMiddleware,
  requireRole,
} from "@/shared/middlewares/auth.middleware";
import { validate } from "@/shared/middlewares/validation.middleware";
import { createUserSchema } from "@supportflow/shared-types";

const router = Router();
const userController = new UserController();

// Tất cả endpoints đều yêu cầu đăng nhập
router.use(authMiddleware);

// 1. API CÁ NHÂN (Tất cả vai trò: Owner, Admin, Agent đều gọi được)
router.get("/me", userController.getProfile);
router.patch("/me", userController.updateProfile);
router.patch("/me/change-password", userController.changePassword);

// 2. API QUẢN LÝ USER (Chỉ Owner & Admin được phép thực hiện)
router.get("/", requireRole(["owner", "admin"]), userController.getUsers);
router.post(
  "/",
  requireRole(["owner", "admin"]),
  validate(createUserSchema),
  userController.createUser,
);
router.patch(
  "/:id/toggle-status",
  requireRole(["owner", "admin"]),
  userController.toggleStatus,
);
router.delete(
  "/:id",
  requireRole(["owner", "admin"]),
  userController.deleteUser,
);

export default router;
