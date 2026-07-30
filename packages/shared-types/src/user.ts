import { z } from "zod";
export type UserRole = "owner" | "admin" | "agent";
export type UserStatus = "active" | "inactive";

export interface IUser {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export const createUserSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải chứa ít nhất 6 ký tự"),
  role: z.enum(["admin", "agent"], {
    message: "Vai trò phải là 'admin' hoặc 'agent'",
  }),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
