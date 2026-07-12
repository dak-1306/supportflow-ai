import { Router } from "express";
import { login, refresh } from "../controllers/auth.controller";
import { validate } from "../../../middlewares/validation.middleware";
import { loginSchema, refreshSchema } from "../validations/auth.validation";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);

export default router;
