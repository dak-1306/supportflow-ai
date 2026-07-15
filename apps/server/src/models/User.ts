import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { transformToJSON } from "../utils/mongoose-preset"; // Path tới file helper của bạn

const UserSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    role: { type: String, enum: ["admin", "agent"], default: "admin" },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    // Cấu hình toJSON riêng biệt cho User để bảo vệ mật khẩu
    toJSON: {
      ...transformToJSON,
      transform: (_doc, ret) => {
        // Chạy qua hàm transform chung để đổi _id -> id và bỏ __v
        const cleanRet = transformToJSON.transform(_doc, ret);
        // Xóa ngay mật khẩu trước khi gửi ra ngoài
        delete cleanRet.password;
        return cleanRet;
      },
    },
  },
);

// Hash password trước khi lưu
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export const User = mongoose.model("User", UserSchema);
