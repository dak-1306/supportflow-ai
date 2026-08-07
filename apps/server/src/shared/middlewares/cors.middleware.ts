import cors from "cors";
import { Request } from "express";

const ALLOWED_ADMIN_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5500",
  "https://supportflow-ai-admin.vercel.app",
  "https://supportflow-ai-widget-seven.vercel.app",
];

export const dynamicCors = cors((req, callback) => {
  // 🟢 Ép kiểu req về Request của Express để truy cập URL chính xác
  const expressReq = req as Request;
  const origin = expressReq.headers.origin;
  const url = expressReq.originalUrl || expressReq.url || "";

  // 1. Kiểm tra nếu là các API Public dành cho Widget hoặc Health Check
  const isPublicRoute =
    url.includes("/public-widget") ||
    url.includes("/customer/") ||
    url.includes("/health");

  if (isPublicRoute) {
    return callback(null, {
      origin: true, // Mở cho mọi domain nhúng Widget
      credentials: true,
    });
  }

  // 2. Kiểm tra nếu là API Admin / Dashboard / Auth
  const isAllowedAdmin = !origin || ALLOWED_ADMIN_ORIGINS.includes(origin);

  callback(null, {
    origin: isAllowedAdmin,
    credentials: true,
  });
});
