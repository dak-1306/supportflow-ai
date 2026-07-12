import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { AuthResponse } from "@supportflow/shared-types";

const generateTokens = (user: any) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "15m" },
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" },
  );
  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    user.lastLogin = new Date();
    await user.save();

    const responseData: AuthResponse = {
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role as "admin" | "agent",
        createdAt: user.createdAt.toISOString(),
      },
      accessToken,
      refreshToken,
    };

    return res.json(responseData);
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const refresh = async (req: Request, res: Response): Promise<any> => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: "Refresh Token là bắt buộc" });

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET!,
    ) as { id: string };
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User không tồn tại" });

    const tokens = generateTokens(user);
    return res.json(tokens);
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Refresh Token không hợp lệ hoặc đã hết hạn" });
  }
};
