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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Cấu hình CORS cho phép cả Admin (5173) và Widget (5174) truy cập
const allowedOrigins = ["http://localhost:5173", "http://localhost:5174"];
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
app.use("/api/v1/workspaces/:workspaceId/documents", knowledgeBaseRouter);
app.use("/api/v1/rag", ragRouter);
app.use("/api/v1", dashboardRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/workspaces", workspaceRoutes);

app.get("/health", (req, res) => {
  res.json({ success: true, message: "OK", data: { timestamp: new Date() } });
});

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
