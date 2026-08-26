import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { ApiErrorResponse } from "@supportflow/shared-types";

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  const responseBody: ApiErrorResponse = {
    success: false,
    message,
  };

  res.status(statusCode).json(responseBody);
};
