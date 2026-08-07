import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "@/modules/auth/routes/auth.route";
import chatRouter from "@/modules/chat/routes/chat.routes";
import dashboardRouter from "@/modules/dashboard/routes/dashboard.routes";
import { knowledgeBaseRouter } from "@/modules/knowledge-base/routes/knowledge-base.route";
import ragRouter from "@/modules/chat/routes/rag.route";
import userRouter from "@/modules/user/routes/user.route";
import { workspaceRoutes } from "@/modules/workspace/routes/workspace.routes";
import { uploadRoutes } from "./modules/upload/upload.routes";

import { errorHandler } from "@/shared/middlewares/error.middleware";
import { connectDatabase } from "@/shared/config/database";
import { initSocketHandler } from "@/modules/chat/socket/socketHandler";
import { adminStrictCors } from "@/shared/middlewares/cors.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS Mặc định: Bảo vệ toàn bộ hệ thống Admin Dashboard
app.use(adminStrictCors);
app.use(express.json());

// 2. Socket.IO Mở rộng cho Widget nhúng
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // WebSocket từ Widget các nơi đều kết nối được
    methods: ["GET", "POST"],
  },
});

app.set("io", io);
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

// Health check & Error Handler
const healthCheckHandler = (req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
};
app.get("/health", healthCheckHandler);
app.get("/api/v1/health", healthCheckHandler);
app.use(errorHandler);

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
