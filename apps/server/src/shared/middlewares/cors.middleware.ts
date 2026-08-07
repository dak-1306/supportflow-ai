import cors from "cors";

const ALLOWED_ADMIN_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5500",
  "https://supportflow-ai-admin.vercel.app",
  "https://supportflow-ai-widget-seven.vercel.app",
];

// 🟢 1. CORS Mở rộng: Dành cho Widget công khai (nhúng ở bất kỳ domain nào)
export const publicWidgetCors = cors({
  origin: true,
  credentials: true,
});

// 🔴 2. CORS Bảo mật: Dành riêng cho Admin Dashboard & Auth
export const adminStrictCors = cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ADMIN_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      // Trả về false thay vì new Error() để tránh crash sập Server (500)
      callback(null, false);
    }
  },
  credentials: true,
});
