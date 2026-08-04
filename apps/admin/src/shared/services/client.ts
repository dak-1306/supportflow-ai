import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor đính kèm Access Token vào request header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor xử lý lỗi chung (Lỗi 500+ và Lỗi 401 Refresh Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // 1. Xử lý lỗi Máy Chủ (500, 502, 503, 504...)
    // Chỉ chuyển hướng nếu hiện tại CHƯA ĐANG Ở trang /500
    if (status && status >= 500 && window.location.pathname !== "/500") {
      window.location.href = "/500";
      return Promise.reject(error);
    }

    // 2. Xử lý tự động refresh token khi gặp lỗi 401
    const refreshToken = localStorage.getItem("refresh_token");

    if (status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {
            refreshToken,
          },
        );
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại -> xóa token bắt login lại
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
