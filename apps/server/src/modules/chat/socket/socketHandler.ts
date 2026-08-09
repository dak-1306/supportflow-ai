import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import {
  SOCKET_EVENTS,
  SOCKET_ROOMS,
  MESSAGE_SENDER,
} from "@supportflow/shared-types";

// Type mở rộng để loại bỏ (socket as any)
interface AuthenticatedSocket extends Socket {
  user?: any;
}

export const initSocketHandler = (io: Server) => {
  // Middleware Authentication
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token;

    if (token && typeof token === "string" && token.startsWith("Bearer ")) {
      try {
        const pureToken = token.split(" ")[1];
        if (pureToken) {
          const decoded = jwt.verify(
            pureToken,
            process.env.JWT_SECRET || "secret",
          );
          socket.user = decoded;
        }
        return next();
      } catch (err: unknown) {
        console.error("Socket auth error:", (err as Error).message);
        return next(new Error("Authentication error"));
      }
    }
    next();
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    // 🟢 Join Workspace Room (Cho Admin)
    socket.on(
      SOCKET_EVENTS.JOIN_WORKSPACE,
      (data: { workspaceId: string } | string) => {
        const workspaceId = typeof data === "string" ? data : data?.workspaceId;
        if (workspaceId) {
          const roomName = SOCKET_ROOMS.WORKSPACE(workspaceId);
          socket.join(roomName);
          console.log(`[Socket] Client ${socket.id} joined ${roomName}`);
        }
      },
    );

    // 🟢 Join Conversation Room (Cho cả Widget & Admin)
    socket.on(
      SOCKET_EVENTS.JOIN_ROOM,
      (data: { conversationId: string } | string) => {
        const conversationId =
          typeof data === "string" ? data : data?.conversationId;

        if (conversationId) {
          const roomName = SOCKET_ROOMS.CONVERSATION(conversationId);
          socket.join(roomName);
          const clientType = socket.user
            ? MESSAGE_SENDER.ADMIN
            : MESSAGE_SENDER.CUSTOMER;
          console.log(
            `[Socket] Client ${socket.id} (${clientType}) JOINED ${roomName}`,
          );
        } else {
          console.warn(
            `[Socket] Client ${socket.id} gửi ${SOCKET_EVENTS.JOIN_ROOM} thiếu conversationId:`,
            data,
          );
        }
      },
    );

    // 🟢 Leave Conversation Room
    socket.on(
      SOCKET_EVENTS.LEAVE_ROOM,
      (data: { conversationId: string } | string) => {
        const conversationId =
          typeof data === "string" ? data : data?.conversationId;
        if (conversationId) {
          const roomName = SOCKET_ROOMS.CONVERSATION(conversationId);
          socket.leave(roomName);
          console.log(`[Socket] Client ${socket.id} left ${roomName}`);
        }
      },
    );

    // 🟢 Typing Status Indicator
    socket.on(
      SOCKET_EVENTS.TYPING_STATUS,
      (data: {
        conversationId: string;
        isTyping: boolean;
        sender?: string;
      }) => {
        if (data?.conversationId) {
          socket
            .to(SOCKET_ROOMS.CONVERSATION(data.conversationId))
            .emit(SOCKET_EVENTS.TYPING_STATUS, {
              conversationId: data.conversationId,
              isTyping: data.isTyping,
              sender: data.sender || MESSAGE_SENDER.CUSTOMER,
            });
        }
      },
    );

    socket.on("disconnect", () => {});
  });
};
