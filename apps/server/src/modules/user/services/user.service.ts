import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";
import { AppError } from "@/shared/utils/app-error";
import { CreateUserDto } from "@supportflow/shared-types";

export class UserService {
  private userRepo = new UserRepository();

  // 1. Lấy thông tin cá nhân hiện tại
  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError("Không tìm thấy người dùng", 404);
    return user;
  }

  // 2. Cập nhật thông tin cá nhân (Tên, Avatar)
  async updateProfile(userId: string, dto: { name?: string; avatar?: string }) {
    const updatedUser = await this.userRepo.update(userId, {
      ...(dto.name && { name: dto.name }),
      ...(dto.avatar !== undefined && { avatar: dto.avatar }),
    });

    if (!updatedUser) throw new AppError("Cập nhật thông tin thất bại", 400);
    return updatedUser;
  }

  // 3. Đổi mật khẩu
  async changePassword(
    userId: string,
    dto: { currentPassword?: string; newPassword?: string },
  ) {
    const { currentPassword, newPassword } = dto;
    if (!currentPassword || !newPassword) {
      throw new AppError("Vui lòng nhập đầy đủ mật khẩu cũ và mới!", 400);
    }

    const userDoc = await this.userRepo.findByIdWithPassword(userId);
    if (!userDoc) throw new AppError("Không tìm thấy người dùng", 404);

    // 1. Kiểm tra mật khẩu hiện tại
    const isMatch = await bcrypt.compare(currentPassword, userDoc.password);
    if (!isMatch) {
      throw new AppError("Mật khẩu hiện tại không chính xác!", 400);
    }

    // 2. Gán trực tiếp mật khẩu mới chưa băm
    userDoc.password = newPassword;

    // 3. Gọi .save() -> Mongoose pre('save') sẽ tự động băm mật khẩu đúng 1 lần!
    await userDoc.save();

    return true;
  }

  // 4. Lấy danh sách nhân viên trong cùng Workspace
  async getWorkspaceUsers(
    workspaceId: string,
    operatorRole: "owner" | "admin" | "agent",
  ) {
    return await this.userRepo.findByWorkspace(workspaceId, operatorRole);
  }

  // 5. Tạo tài khoản mới với kiểm tra phân quyền
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

  // 6. Đổi trạng thái active/inactive
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

  const nextStatus = targetUser.status === "active" ? "inactive" : "active";

  // ✅ Dùng hàm update() từ BaseRepository thay vì targetUser.save()
  const updatedUser = await this.userRepo.update(
    targetUser._id || targetUser.id, 
    { status: nextStatus }
  );

  return updatedUser;
}

  // 7. Xóa tài khoản
  async deleteUser(
    operatorUserId: string,
    operatorRole: "owner" | "admin" | "agent",
    targetUserId: string,
    workspaceId: string,
  ) {
    if (operatorUserId === targetUserId) {
      throw new AppError("Bạn không thể tự xóa tài khoản của chính mình!", 400);
    }

    const targetUser = await this.userRepo.findByIdAndWorkspace(
      targetUserId,
      workspaceId,
    );
    if (!targetUser) throw new AppError("Không tìm thấy người dùng", 404);

    if (targetUser.role === "owner") {
      throw new AppError("Không thể xóa tài khoản Owner!", 403);
    }

    if (operatorRole === "admin" && targetUser.role === "admin") {
      throw new AppError("Admin không thể xóa tài khoản Admin khác!", 403);
    }

    await this.userRepo.delete(targetUserId);
    return true;
  }
}
