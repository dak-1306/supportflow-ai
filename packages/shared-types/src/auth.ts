import { z } from "zod";
import { IUser } from "./user";
export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}

export const loginSchema = z.object({
  email: z.string().email("Email không đúng định dạng"),
  password: z.string().min(6, "Mật khẩu phải tối thiểu 6 ký tự"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh Token là bắt buộc"),
});
