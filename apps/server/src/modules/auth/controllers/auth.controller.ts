import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../../../shared/utils/api-response";

const authService = new AuthService();

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);

    sendSuccess(res, result, "Đăng nhập thành công");
  } catch (error) {
    next(error);
  }
};

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);

    sendSuccess(res, tokens, "Làm mới token thành công");
  } catch (error) {
    next(error);
  }
};
