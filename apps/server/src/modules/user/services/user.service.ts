import { UserRepository } from "../repositories/user.repository";
import { AppError } from "@/shared/utils/app-error";
import { CreateUserDto } from "@/modules/user/validations/user.validation";

export class UserService {
  private userRepo = new UserRepository();

  // 1. Lấy danh sách nhân viên trong cùng Workspace
  async getWorkspaceUsers(workspaceId: string) {
    return await this.userRepo.findByWorkspace(workspaceId);
  }

  // 2. Tạo tài khoản mới với kiểm tra phân quyền
  async createUser(
    operatorRole: "owner" | "admin" | "agent",
    workspaceId: string,
    dto: CreateUserDto,
  ) {
    if (operatorRole === "admin" && dto.role === "admin") {
      throw new AppError("Tài khoản Admin chỉ có quyền tạo Agent!", 403);
    }

    if ((dto.role as string) === "owner") {
      throw new AppError("Không thể tạo thêm tài khoản Owner!", 403);
    }

    const existingUser = await this.userRepo.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError("Email này đã được sử dụng trong hệ thống!", 400);
    }

    const newUser = await this.userRepo.create({
      ...dto,
      workspaceId,
      status: "active",
    });

    return newUser;
  }

  // 3. Đổi trạng thái active/inactive
  async toggleUserStatus(
    operatorRole: "owner" | "admin" | "agent",
    targetUserId: string,
    workspaceId: string,
  ) {
    const targetUser = await this.userRepo.findByIdAndWorkspace(
      targetUserId,
      workspaceId,
    );
    if (!targetUser) throw new AppError("Không tìm thấy người dùng", 404);

    if (targetUser.role === "owner") {
      throw new AppError("Không thể thay đổi trạng thái của Owner!", 403);
    }

    if (operatorRole === "admin" && targetUser.role === "admin") {
      throw new AppError("Admin không thể khóa tài khoản Admin khác!", 403);
    }

    targetUser.status = targetUser.status === "active" ? "inactive" : "active";
    await targetUser.save();
    return targetUser;
  }
}
