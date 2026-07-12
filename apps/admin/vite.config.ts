import { defineConfig } from "vite";
import someReact from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [someReact()],
  server: {
    port: 5173,
  },
});
