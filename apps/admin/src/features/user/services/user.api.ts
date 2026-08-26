// features/user/services/user.api.ts
import { api } from "@/shared/services/client";
import { IUser, CreateUserDto } from "@supportflow/shared-types";

export const userApi = {
  getUsers: (): Promise<IUser[]> => api.get<IUser[]>("/users"),

  createUser: (payload: CreateUserDto): Promise<IUser> =>
    api.post<IUser>("/users", payload),

  toggleStatus: (userId: string): Promise<IUser> =>
    api.patch<IUser>(`/users/${userId}/toggle-status`),

  deleteUser: (userId: string): Promise<void> =>
    api.delete<void>(`/users/${userId}`),
};
