import { UserRepository } from "../repositories/user.repository";
import { AppError } from "@/shared/utils/app-error";
import { CreateUserDto } from "@supportflow/shared-types";

export class UserService {
  private userRepo = new UserRepository();

  // 1. Lấy danh sách nhân viên trong cùng Workspace
  async getWorkspaceUsers(
    workspaceId: string,
    operatorRole: "owner" | "admin" | "agent",
  ) {
    return await this.userRepo.findByWorkspace(workspaceId, operatorRole);
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

  // 4. Bổ sung hàm deleteUser với các quy tắc phân quyền chuẩn
  async deleteUser(
    operatorUserId: string,
    operatorRole: "owner" | "admin" | "agent",
    targetUserId: string,
    workspaceId: string,
  ) {
    // Không cho phép tự xóa chính mình
    if (operatorUserId === targetUserId) {
      throw new AppError("Bạn không thể tự xóa tài khoản của chính mình!", 400);
    }

    const targetUser = await this.userRepo.findByIdAndWorkspace(
      targetUserId,
      workspaceId,
    );
    if (!targetUser) throw new AppError("Không tìm thấy người dùng", 404);

    // Không ai có thể xóa Owner
    if (targetUser.role === "owner") {
      throw new AppError("Không thể xóa tài khoản Owner!", 403);
    }

    // Admin không được xóa Admin khác
    if (operatorRole === "admin" && targetUser.role === "admin") {
      throw new AppError("Admin không thể xóa tài khoản Admin khác!", 403);
    }

    await this.userRepo.delete(targetUserId);
    return true;
  }
}
