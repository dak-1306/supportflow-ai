import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Email không đúng định dạng"),
    password: z.string().min(6, "Mật khẩu phải tối thiểu 6 ký tự"),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh Token là bắt buộc"),
  }),
});
