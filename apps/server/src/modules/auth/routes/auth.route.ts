import { Router } from "express";
import { login, refresh, register } from "../controllers/auth.controller";
import { validate } from "../../../shared/middlewares/validation.middleware";
import {
  loginSchema,
  refreshSchema,
  registerSchema,
} from "@supportflow/shared-types";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/register", validate(registerSchema), register);

export default router;
