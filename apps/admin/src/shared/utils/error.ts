import { ApiErrorResponse } from "@supportflow/shared-types";

export const getErrorMessage = (
  error: unknown,
  fallback = "Đã có lỗi xảy ra!",
): string => {
  if (!error) return fallback;

  // Lấy message từ ApiErrorResponse trả về qua Axios Interceptor
  const apiError = error as ApiErrorResponse;
  if (apiError.message) {
    return apiError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
