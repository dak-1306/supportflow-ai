export interface IUser {
  id: string;
  workspaceId: string; // Thêm để xác định User thuộc doanh nghiệp nào
  name: string;
  email: string;
  avatar?: string; // Thêm trường avatar (optional)
  status: "active" | "inactive"; // Thêm để quản lý trạng thái tài khoản công tác
  role: "admin" | "agent";
  lastLogin?: string; // Thêm để hiển thị thời gian đăng nhập gần nhất trên UI
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
