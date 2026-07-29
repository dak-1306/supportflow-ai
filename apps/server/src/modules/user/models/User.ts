import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { transformToJSON } from "../../../shared/utils/mongoose-preset";

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
    // Thêm role 'owner' vào enum
    role: { type: String, enum: ["owner", "admin", "agent"], default: "agent" },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      ...transformToJSON,
      transform: (_doc, ret) => {
        const cleanRet = transformToJSON.transform(_doc, ret);
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
