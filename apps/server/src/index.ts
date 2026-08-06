import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "@/modules/auth/routes/auth.route";
import chatRouter from "@/modules/chat/routes/chat.routes";
import dashboardRouter from "@/modules/dashboard/routes/dashboard.routes";
import { knowledgeBaseRouter } from "@/modules/knowledge-base/routes/knowledge-base.route";
import ragRouter from "@/modules/chat/routes/rag.route";
import userRouter from "@/modules/user/routes/user.route";

import { errorHandler } from "@/shared/middlewares/error.middleware";
import { connectDatabase } from "@/shared/config/database";

import { createServer } from "http";
import { Server } from "socket.io";
import { initSocketHandler } from "@/modules/chat/socket/socketHandler";
import { workspaceRoutes } from "@/modules/workspace/routes/workspace.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Cấu hình CORS cho phép cả Admin (5173) và Widget (5174) truy cập
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5500",
  "https://supportflow-ai-admin.vercel.app",
  "https://supportflow-ai-widget-seven.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép request không có origin (như curl, Postman hoặc thiết bị di động)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());

// 2. Khởi tạo HTTP Server bọc Express để dùng chung cho cả HTTP và Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins, // Đồng bộ danh sách CORS với Socket.IO
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Lưu instance io vào Express context
app.set("io", io);

// Kích hoạt Socket Handler
initSocketHandler(io);

// 3. Khai báo Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", chatRouter);
app.use("/api/v1/workspaces", workspaceRoutes);
app.use("/api/v1/workspaces/:workspaceId/documents", knowledgeBaseRouter);
app.use("/api/v1/rag", ragRouter);
app.use("/api/v1", dashboardRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/uploads", uploadRoutes);

// Hàm xử lý health check dùng chung
const healthCheckHandler = (req: express.Request, res: express.Response) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

// 1. Phục vụ cho UptimeRobot / Render Monitor ở Root
app.get("/health", healthCheckHandler);

// 2. Phục vụ cho Frontend / Health Check Service ở API v1
app.get("/api/v1/health", healthCheckHandler);

// Global Error Handler (Luôn đặt dưới cùng của các Route)
app.use(errorHandler);

// 4. Khởi động hệ thống thông qua httpServer (TUYỆT ĐỐI không dùng app.listen)
const bootstrap = async () => {
  try {
    await connectDatabase();
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to bootstrap server:", error);
  }
};

bootstrap();
