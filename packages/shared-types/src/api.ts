// packages/shared-types/src/api.ts

// 1. Dạng dữ liệu trả về thành công
export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

// 2. Dạng dữ liệu trả về khi có lỗi
export interface ApiErrorResponse {
  success: false;
  message: string;
  statusCode?: number;
  errors?: Record<string, string>; // Phục vụ lỗi validation từng trường của Form (nếu có)
}

// 3. Type tổng hợp cho API Response
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
