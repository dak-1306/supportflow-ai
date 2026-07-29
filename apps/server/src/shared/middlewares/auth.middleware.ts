import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/app-error";

// 1. Thêm 'owner' vào định nghĩa Role
export type UserRole = "owner" | "admin" | "agent";

export interface IJwtPayload {
  id: string;
  role: UserRole;
  workspaceId: string;
}

// 2. Khai báo mở rộng Request type của Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string;
        workspaceId: string;
        role: UserRole;
      };
    }
  }
}

// 3. Middleware xác thực JWT
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
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_secret",
      ) as IJwtPayload;

      // Gán thông tin giải mã từ Token vào req.user
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

// 4. Middleware kiểm tra phân quyền theo Role
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError("Chưa xác thực người dùng.", 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError("Bạn không có quyền thực hiện thao tác này.", 403),
      );
    }

    next();
  };
};
