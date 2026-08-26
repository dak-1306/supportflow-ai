import { Response } from "express";
import { ApiSuccessResponse } from "@supportflow/shared-types";

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = "Success",
  status = 200,
) => {
  const responseBody: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(status).json(responseBody);
};
