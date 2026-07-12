export interface IUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "agent";
  createdAt: string;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
