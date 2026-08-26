import { api } from "@/shared/services/client";
import { LoginFormValues, RegisterFormValues } from "@supportflow/shared-types";

export const AuthService = {
  async login(body: LoginFormValues) {
    const response = await api.post("/auth/login", body);
    return response; // Trả về cấu trúc chuẩn { success, message, data }
  },
  async refresh(refreshToken: string) {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response;
  },
  async register(body: RegisterFormValues) {
    const response = await api.post("/auth/register", body);
    return response;
  },
};
