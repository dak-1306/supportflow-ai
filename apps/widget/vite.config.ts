import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    cssInjectedByJsPlugin(), // Inject toàn bộ CSS vào file JS
  ],
  server: {
    port: 5174,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 100000000, // Inline hình ảnh/icon dưới dạng Base64
    rollupOptions: {
      input: path.resolve(__dirname, "src/main.tsx"),
      output: {
        format: "iife", // Đóng gói dạng IIFE để chạy ngay trên trình duyệt
        entryFileNames: "widget.js", // Cố định tên file đầu ra
        assetFileNames: "[name].[ext]",
        chunkFileNames: "[name].js",
      },
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production",
    ),
  },
});
