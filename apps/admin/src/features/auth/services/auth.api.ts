import { api } from "../../../services/client";

export const AuthService = {
  async login(body: any) {
    const response = await api.post("/auth/login", body);
    return response.data; // Trả về cấu trúc chuẩn { success, message, data }
  },
  async refresh(refreshToken: string) {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },
};
