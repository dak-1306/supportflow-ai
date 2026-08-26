// shared/api/refresh-manager.ts
import axios, { AxiosResponse } from "axios"; // 🟢 1. Import thêm AxiosResponse
import { tokenStorage } from "../utils/token-storage";
import { ApiSuccessResponse } from "@supportflow/shared-types";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

export const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else if (token) promise.resolve(token!);
  });
  failedQueue = [];
};

export const handleRefreshToken = async (
  originalRequest: any,
  apiInstance: any,
) => {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    tokenStorage.clearTokens();
    window.location.href = "/login";
    return Promise.reject(new Error("No refresh token"));
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiInstance(originalRequest);
    });
  }

  originalRequest._retry = true;
  isRefreshing = true;

  try {
    // 🟢 2. Khai báo 2 tầng vỏ cho Axios thô: AxiosResponse -> ApiSuccessResponse
    const res = await axios.post<
      AxiosResponse<
        ApiSuccessResponse<{ accessToken: string; refreshToken: string }>
      >
    >(`${import.meta.env.VITE_API_URL}/auth/refresh`, { refreshToken });

    // 🟢 3. Bây giờ res.data.data hoạt động hoàn hảo cả ở TS lẫn Runtime:
    const { accessToken, refreshToken: newRefreshToken } = res.data.data;

    tokenStorage.setTokens(accessToken, newRefreshToken);

    apiInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    processQueue(null, accessToken);
    return apiInstance(originalRequest);
  } catch (refreshError) {
    processQueue(refreshError, null);
    tokenStorage.clearTokens();
    window.location.href = "/login";
    return Promise.reject(refreshError);
  } finally {
    isRefreshing = false;
  }
};
