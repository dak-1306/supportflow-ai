import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { tokenStorage } from "../utils/token-storage";
import { handleRefreshToken } from "./refresh-manager";
import { ApiErrorResponse } from "@supportflow/shared-types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Unwrap data & Phân luồng lỗi
api.interceptors.response.use(
  (response) => {
    // UNWRAP DATA: Trả trực tiếp data ra ngoài, loại bỏ .data.data
    return response.data?.data !== undefined
      ? response.data.data
      : response.data;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    // 1. Lỗi Token 401: Tiến hành Refresh Token
    if (status === 401 && originalRequest && !originalRequest._retry) {
      return handleRefreshToken(originalRequest, api);
    }

    // 2. Mất kết nối mạng (Network Error)
    if (!error.response) {
      toast.error(
        "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng.",
      );
    }

    // 3. Reject đối tượng lỗi chuẩn ApiErrorResponse về cho React Query / Form Handler
    const errorData = error.response?.data;
    return Promise.reject({
      status,
      success: false,
      message: errorData?.message || error.message || "Đã có lỗi xảy ra",
    });
  },
);
