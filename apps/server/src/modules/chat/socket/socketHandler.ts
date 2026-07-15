import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const initSocketHandler = (io: Server) => {
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;

    // Chỉ xác thực nếu token tồn tại và có định dạng hợp lệ
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
        // Log lỗi nhưng không chặn đứng hoàn toàn kết nối public nếu đó là widget
        console.error("Socket auth error:", (err as Error).message);
        return next(new Error("Authentication error"));
      }
    }
    next();
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join_room", (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.join(`room_${data.conversationId}`);
      }
    });

    socket.on("leave_room", (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.leave(`room_${data.conversationId}`);
      }
    });

    socket.on(
      "typing_status",
      (data: { conversationId: string; isTyping: boolean }) => {
        if (data?.conversationId) {
          socket.to(`room_${data.conversationId}`).emit("typing_status", {
            conversationId: data.conversationId,
            isTyping: data.isTyping,
          });
        }
      },
    );

    socket.on("disconnect", () => {});
  });
};
