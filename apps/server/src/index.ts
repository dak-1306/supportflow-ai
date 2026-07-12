import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route";
import { User } from "./models/User";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

import { Workspace } from "./models/Workspace"; // Thêm dòng import này ở trên cùng file

// Thay thế hàm seedAdmin cũ bằng hàm này:
async function seedAdmin() {
  // 1. Kiểm tra hoặc tạo một Workspace mặc định cho MVP
  let defaultWorkspace = await Workspace.findOne({
    name: "SupportFlow Default",
  });
  if (!defaultWorkspace) {
    defaultWorkspace = await Workspace.create({
      name: "SupportFlow Default",
      logo: "",
      status: "active",
    });
    console.log("💡 Seeded default workspace.");
  }

  // 2. Kiểm tra và tạo tài khoản Admin gắn liền với Workspace đó
  const adminExist = await User.findOne({ email: "admin@supportflow.com" });
  if (!adminExist) {
    await User.create({
      workspaceId: defaultWorkspace._id,
      name: "System Admin",
      email: "admin@supportflow.com",
      password: "password123",
      role: "admin",
      status: "active",
    });
    console.log(
      "💡 Seeded default admin account: admin@supportflow.com / password123",
    );
  }
}

mongoose
  .connect(process.env.MONGODB_URI!)
  .then(async () => {
    console.log("✅ MongoDB Connected");
    await seedAdmin();
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`),
    );
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });
