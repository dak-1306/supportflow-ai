import mongoose from "mongoose";
import { UserRepository } from "@/modules/user/repositories/user.repository";
import { WorkspaceRepository } from "@/modules/workspace/repositories/workspace.repository";

async function seedOwner(): Promise<void> {
  const workspaceRepo = new WorkspaceRepository();
  const userRepo = new UserRepository();

  // 1. Kiểm tra / Khởi tạo Workspace mặc định
  let defaultWorkspace = await workspaceRepo.findOne({
    name: "SupportFlow Default",
  });

  if (!defaultWorkspace) {
    defaultWorkspace = await workspaceRepo.create({
      name: "SupportFlow Default",
      logo: "",
      status: "active",
      // Mongoose Schema sẽ tự áp dụng giá trị default cho aiConfig & widgetConfig
    });
    console.log("💡 Seeded default workspace.");
  }

  // 2. Lấy thông tin Owner từ .env hoặc dùng giá trị mặc định
  const ownerEmail = process.env.OWNER_EMAIL || "owner@supportflow.com";
  const ownerPassword = process.env.OWNER_PASSWORD || "password123";

  const ownerExist = await userRepo.findByEmail(ownerEmail);
  if (!ownerExist) {
    await userRepo.create({
      workspaceId: defaultWorkspace._id,
      name: "System Owner",
      email: ownerEmail,
      password: ownerPassword,
      role: "owner", // Gán role 'owner' cao nhất
      status: "active",
    });
    console.log(`💡 Seeded default owner account (${ownerEmail}).`);
  }
}

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB Connected");

    // Thực hiện seed dữ liệu Owner ban đầu
    await seedOwner();
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  }
};
