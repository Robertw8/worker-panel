import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    allowedHosts: ["clocks-region-engine-visited.trycloudflare.com"],
    port: 5173,
    strictPort: true,

    proxy: {
      "/auth": {
        target: process.env.AUTH_PROXY_TARGET || "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
