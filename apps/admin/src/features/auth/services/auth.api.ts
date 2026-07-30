import { api } from "@/services/client";
import { LoginFormValues } from "@supportflow/shared-types";

export const AuthService = {
  async login(body: LoginFormValues) {
    const response = await api.post("/auth/login", body);
    return response.data; // Trả về cấu trúc chuẩn { success, message, data }
  },
  async refresh(refreshToken: string) {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  },
};
