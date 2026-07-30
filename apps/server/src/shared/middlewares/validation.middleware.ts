// src/shared/middlewares/validation.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";

type ValidationTarget = "body" | "query" | "params";

export const validate =
  (schema: ZodType, target: ValidationTarget = "body") =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate đúng target (mặc định là body) và gán lại dữ liệu đã qua transform
      req[target] = await schema.parseAsync(req[target]);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: "Dữ liệu đầu vào không hợp lệ",
          data: error.issues.map((e) => ({
            // Bỏ đi tiền tố target nếu có để FE nhận đúng tên field (ví dụ "name" thay vì "body.name")
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return next(error);
    }
  };
