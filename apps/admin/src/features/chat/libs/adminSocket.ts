// src/lib/adminSocket.ts
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const getAdminToken = () => {
  // 1. Thử lấy trực tiếp từ localStorage
  let token = localStorage.getItem("access_token");

  // 2. Nếu không có, thử bóc tách từ Zustand Persist Storage ("auth-storage")
  if (!token) {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token || parsed?.state?.accessToken || null;
      }
    } catch (e) {
      console.error("Lỗi parse auth-storage:", e);
    }
  }

  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
};

export const adminSocket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  auth: (cb) => {
    // Dynamic callback đảm bảo luôn lấy token mới nhất mỗi lần connect/reconnect
    cb({ token: getAdminToken() });
  },
});
