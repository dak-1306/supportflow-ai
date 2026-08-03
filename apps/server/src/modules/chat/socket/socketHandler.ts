import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const initSocketHandler = (io: Server) => {
  // Middleware Authentication
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;

    if (token && typeof token === "string" && token.startsWith("Bearer ")) {
      try {
        const parts = token.split(" ");
        if (parts.length === 2) {
          const pureToken = parts[1];
          const decoded = jwt.verify(
            pureToken,
            process.env.JWT_SECRET || "secret",
          );
          (socket as any).user = decoded;
        }
        return next();
      } catch (err: unknown) {
        console.error("Socket auth error:", (err as Error).message);
        return next(new Error("Authentication error"));
      }
    }
    next();
  });

  io.on("connection", (socket: Socket) => {
    // 🟢 Join Workspace Room (Cho Admin)
    socket.on("join_workspace", (data: { workspaceId: string } | string) => {
      const workspaceId = typeof data === "string" ? data : data?.workspaceId;
      if (workspaceId) {
        const roomName = `workspace_${workspaceId}`;
        socket.join(roomName);
        console.log(`[Socket] Client ${socket.id} joined ${roomName}`);
      }
    });

    // 🟢 Join Conversation Room (Cho cả Widget & Admin)

    socket.on("join_room", (data: { conversationId: string } | string) => {
      // Chuẩn hóa conversationId từ cả Object lẫn String
      const conversationId =
        typeof data === "string" ? data : data?.conversationId;

      if (conversationId) {
        const roomName = `room_${conversationId}`;
        socket.join(roomName);
        console.log(
          `[Socket] Client ${socket.id} (${(socket as any).user ? "ADMIN" : "WIDGET"}) JOINED ${roomName}`,
        );
      } else {
        console.warn(
          `[Socket] Client ${socket.id} gửi join_room thiếu conversationId:`,
          data,
        );
      }
    });

    // 🟢 Leave Conversation Room
    socket.on("leave_room", (data: { conversationId: string } | string) => {
      const conversationId =
        typeof data === "string" ? data : data?.conversationId;
      if (conversationId) {
        const roomName = `room_${conversationId}`;
        socket.leave(roomName);
        console.log(`[Socket] Client ${socket.id} left ${roomName}`);
      }
    });

    // 🟢 Typing Status Indicator
    socket.on(
      "typing_status",
      (data: {
        conversationId: string;
        isTyping: boolean;
        sender?: string;
      }) => {
        if (data?.conversationId) {
          socket.to(`room_${data.conversationId}`).emit("typing_status", {
            conversationId: data.conversationId,
            isTyping: data.isTyping,
            sender: data.sender || "CUSTOMER",
          });
        }
      },
    );

    socket.on("disconnect", () => {});
  });
};
