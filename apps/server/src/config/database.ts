import mongoose from "mongoose";
import { UserRepository } from "../modules/auth/repositories/user.repository";
import { WorkspaceRepository } from "../modules/auth/repositories/workspace.repository";

async function seedAdmin(): Promise<void> {
  const workspaceRepo = new WorkspaceRepository();
  const userRepo = new UserRepository();

  let defaultWorkspace = await workspaceRepo.findOne({
    name: "SupportFlow Default",
  });

  if (!defaultWorkspace) {
    defaultWorkspace = await workspaceRepo.create({
      name: "SupportFlow Default",
      logo: "",
      status: "active",
    });
    console.log("💡 Seeded default workspace.");
  }

  const adminExist = await userRepo.findByEmail("admin@supportflow.com");
  if (!adminExist) {
    await userRepo.create({
      workspaceId: defaultWorkspace._id,
      name: "System Admin",
      email: "admin@supportflow.com",
      password: "password123",
      role: "admin",
      status: "active",
    });
    console.log("💡 Seeded default admin account.");
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

    // Thực hiện seed data sau khi kết nối thành công
    await seedAdmin();
  } catch (err) {
    console.error("❌ DB Connection Error:", err);
    process.exit(1); // Dừng ứng dụng nếu không kết nối được DB
  }
};
