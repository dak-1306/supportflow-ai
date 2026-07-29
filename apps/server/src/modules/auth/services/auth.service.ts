import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repositories/user.repository";
import { AppError } from "../../../shared/utils/app-error";

export class AuthService {
  private userRepository = new UserRepository();

  private generateTokens(user: any) {
    const accessToken = jwt.sign(
      {
        id: user._id.toString(),
        role: user.role,
        workspaceId: user.workspaceId.toString(), // Nhúng trực tiếp workspaceId vào payload
      },
      process.env.JWT_SECRET!,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" },
    );

    return { accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new AppError("Email hoặc mật khẩu không đúng", 401);
    }

    if (user.status !== "active") {
      throw new AppError("Tài khoản đã bị khóa", 403);
    }

    const tokens = this.generateTokens(user);
    await this.userRepository.updateLastLogin(user._id);

    return {
      user: {
        id: user._id.toString(),
        workspaceId: user.workspaceId.toString(), // Thêm dòng này
        name: user.name,
        email: user.email,
        avatar: user.avatar || "", // Thêm dòng này
        status: user.status as "active" | "inactive", // Thêm dòng này
        role: user.role as "admin" | "agent",
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : undefined, // Thêm dòng này
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(), // Thêm dòng này
      },
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!,
      ) as { id: string };
      const user = await this.userRepository.findById(decoded.id);
      if (!user || user.status !== "active") {
        throw new AppError("User không tồn tại hoặc bị khóa", 401);
      }
      return this.generateTokens(user);
    } catch (err) {
      throw new AppError("Refresh Token không hợp lệ hoặc đã hết hạn", 403);
    }
  }
}
