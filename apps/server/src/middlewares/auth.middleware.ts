import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";

interface IJwtPayload {
  id: string;
  role: "admin" | "agent";
  workspaceId: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Quyền truy cập bị từ chối. Token không hợp lệ.", 401);
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as IJwtPayload;

      // Gán thẳng thông tin giải mã từ Token vào Request Object
      req.user = {
        _id: decoded.id,
        workspaceId: decoded.workspaceId,
        role: decoded.role,
      };

      next();
    } catch (err) {
      throw new AppError("Token đã hết hạn hoặc không hợp lệ.", 401);
    }
  } catch (error) {
    next(error);
  }
};
