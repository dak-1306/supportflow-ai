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

// Khóa nguyên Route: Chỉ Owner và Admin mới được vào
router.use(authMiddleware, requireRole(["owner", "admin"]));

router.get("/", userController.getUsers);
router.post("/", validate(createUserSchema), userController.createUser);
router.patch("/:id/toggle-status", userController.toggleStatus);
router.delete("/:id", userController.deleteUser);

export default router;
