import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRepository } from "../../user/repositories/user.repository";
import { AppError } from "../../../shared/utils/app-error";

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
