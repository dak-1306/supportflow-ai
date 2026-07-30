import { User } from "@/modules/user/models/User";
import { BaseRepository } from "@/shared/repositories/base.repository";

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super(User);
  }

  // --- Phục vụ AuthService & UserService ---

  /**
   * Lưu ý: Khi Auth cần lấy password để so sánh Bcrypt,
   * ta query Mongoose Document trực tiếp
   */
  async findByEmailWithPassword(email: string) {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByEmail(email: string) {
    const doc = await this.model.findOne({ email: email.toLowerCase() }).exec();
    return doc ? doc.toJSON() : null;
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.model.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  // --- Phục vụ UserService ---
  async findByWorkspace(
    workspaceId: string,
    operatorRole?: "owner" | "admin" | "agent",
  ) {
    const query: Record<string, any> = { workspaceId };

    if (operatorRole === "admin") {
      query.role = { $ne: "owner" };
    }

    const docs = await this.model.find(query).sort({ createdAt: -1 }).exec();

    // toJSON đã tự động xóa trường password theo định nghĩa Schema
    return docs.map((doc) => doc.toJSON());
  }

  async findByIdAndWorkspace(userId: string, workspaceId: string) {
    const doc = await this.model.findOne({ _id: userId, workspaceId }).exec();
    return doc ? doc.toJSON() : null;
  }
}
