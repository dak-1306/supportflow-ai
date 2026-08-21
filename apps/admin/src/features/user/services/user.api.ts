import { api } from "@/shared/services/client";
import { IUser, CreateUserDto } from "@supportflow/shared-types";

export const userApi = {
  getUsers: async (): Promise<IUser[]> => {
    const { data } = await api.get("/users");
    return data.data;
  },

  createUser: async (payload: CreateUserDto): Promise<IUser> => {
    const { data } = await api.post("/users", payload);
    return data.data;
  },

  toggleStatus: async (userId: string): Promise<IUser> => {
    const { data } = await api.patch(`/users/${userId}/toggle-status`);
    return data.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },
};