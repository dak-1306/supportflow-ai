import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repositories/user.repository";
import { workspaceService } from "../../workspace/services/workspace.service";
import { AppError } from "../../../shared/utils/app-error";
import { RegisterFormValues } from "@supportflow/shared-types";

export class AuthService {
  private userRepository = new UserRepository();

  private generateTokens(user: {
    id: string;
    role: string;
    workspaceId: string;
  }) {
    const accessToken = jwt.sign(
      {
        id: user.id.toString(),
        role: user.role,
        workspaceId: user.workspaceId.toString(),
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user.id.toString() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    return { accessToken, refreshToken };
  }

  /**
   * Đăng ký tài khoản Owner mới & Tự động khởi tạo Workspace
   */
  async register(dto: RegisterFormValues) {
    // 1. Kiểm tra Email đã tồn tại chưa
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new AppError("Email này đã được đăng ký trong hệ thống", 400);
    }

    // 2. Tự động tạo Workspace mặc định trước
    const workspace = await workspaceService.createDefaultWorkspace(
      dto.workspaceName,
    );

    // 3. Tạo User với vai trò OWNER (Để Mongoose pre('save') tự động hash dto.password)
    const newOwnerDoc = await this.userRepository.create({
      name: dto.fullName,
      email: dto.email.toLowerCase(),
      password: dto.password, // ✅ Truyền mật khẩu thô, không dùng bcrypt.hash ở đây
      role: "owner",
      workspaceId: workspace.id,
      status: "active",
    });

    const user = newOwnerDoc.toJSON ? newOwnerDoc.toJSON() : newOwnerDoc;

    // 4. Sinh bộ AccessToken & RefreshToken để tự động đăng nhập luôn
    const tokens = this.generateTokens(user);
    await this.userRepository.updateLastLogin(user.id);

    // 5. Cấu hình sẵn đoạn mã Script nhúng Widget với workspaceId vừa tạo
    const cdnUrl =
      process.env.WIDGET_CDN_URL || "https://cdn.supportflow.com/widget.js";
    const embedScript = `<script>window.SupportFlowConfig={workspaceId:"${workspace.id}"};</script>\n<script async src="${cdnUrl}"></script>`;

    // 6. Trả về thông tin User, Workspace, Tokens và Mã Script
    return {
      user,
      workspace,
      ...tokens,
      embedScript,
    };
  }

  async login(email: string, password: string) {
    // 1. Lấy Mongoose Document nguyên bản (chứa trường password)
    const userDoc = await this.userRepository.findByEmailWithPassword(email);

    if (!userDoc || !(await bcrypt.compare(password, userDoc.password))) {
      throw new AppError("Email hoặc mật khẩu không đúng", 401);
    }

    if (userDoc.status !== "active") {
      throw new AppError("Tài khoản đã bị khóa", 403);
    }

    // 2. Chuyển sang Plain JSON Object (Tự động chuyển _id -> id, ẩn password)
    const user = userDoc.toJSON();

    // 3. Tạo Tokens & Cập nhật thời gian đăng nhập
    const tokens = this.generateTokens(user);
    await this.userRepository.updateLastLogin(user.id);

    // 4. Trả về thông tin user sạch gọn gàng
    return {
      user,
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { id: string };

      // findById đã trả về Plain Object qua toJSON (đã có trường id)
      const user = await this.userRepository.findById(decoded.id);

      if (!user || user.status !== "active") {
        throw new AppError("User không tồn tại hoặc bị khóa", 401);
      }

      return this.generateTokens(user as any);
    } catch (err) {
      throw new AppError("Refresh Token không hợp lệ hoặc đã hết hạn", 403);
    }
  }
}

export const authService = new AuthService();
