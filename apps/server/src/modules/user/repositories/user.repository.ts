import { User } from "@/modules/user/models/User";
import { BaseRepository } from "@/shared/repositories/base.repository";

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super(User);
  }

  // --- Phục vụ AuthService & UserService ---
  async findByEmail(email: string) {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  // --- Phục vụ UserService ---
  // Lấy danh sách thành viên trong Workspace (ẩn password & sắp xếp mới nhất)
  async findByWorkspace(
    workspaceId: string,
    operatorRole?: "owner" | "admin" | "agent",
  ) {
    const query: Record<string, any> = { workspaceId };

    // Nếu người xem là Admin -> Không hiển thị các tài khoản Owner
    if (operatorRole === "admin") {
      query.role = { $ne: "owner" };
    }

    return this.model
      .find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .exec();
  }

  // Tìm một user trong Workspace cụ thể (dùng khi check đổi trạng thái / cập nhật)
  async findByIdAndWorkspace(userId: string, workspaceId: string) {
    return this.model.findOne({ _id: userId, workspaceId }).exec();
  }
}
