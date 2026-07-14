import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

export const initSocketHandler = (io: Server) => {
  // Socket Middleware xác thực kết nối riêng đối với Admin kết nối vào hệ thống
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token;

    if (token) {
      try {
        const pureToken = token.split(" ")[1]; // Loại bỏ tiền tố 'Bearer '
        const decoded = jwt.verify(
          pureToken,
          process.env.JWT_SECRET || "secret",
        );
        (socket as any).user = decoded; // Gán payload user admin vào socket instance
        return next();
      } catch (err) {
        return next(new Error("Authentication error"));
      }
    }
    // Đối với Customer kết nối, không truyền token, cho đi qua dạng public khách vãng lai
    next();
  });

  io.on("connection", (socket: Socket) => {
    // Event 1: Client đăng ký gia nhập Room chat hội thoại cố định
    socket.on("join_room", (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.join(`room_${data.conversationId}`);
      }
    });

    // Event 2: Client rời khỏi Room chat
    socket.on("leave_room", (data: { conversationId: string }) => {
      if (data?.conversationId) {
        socket.leave(`room_${data.conversationId}`);
      }
    });

    // Event 3: Điều phối trạng thái gõ bàn phím (Typing Status) trực diện xuyên suốt room
    socket.on(
      "typing_status",
      (data: { conversationId: string; isTyping: boolean }) => {
        if (data?.conversationId) {
          // Broadcast gửi về toàn bộ các socket khác trong room ngoại trừ chính người gửi phát tín hiệu
          socket.to(`room_${data.conversationId}`).emit("typing_status", {
            conversationId: data.conversationId,
            isTyping: data.isTyping,
          });
        }
      },
    );

    socket.on("disconnect", () => {
      // Thực hiện dọn dẹp (nếu cần thiết) khi client đóng tab/ngắt kết nối
    });
  });
};
