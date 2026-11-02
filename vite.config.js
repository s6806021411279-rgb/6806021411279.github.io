
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const target = "http://127.0.0.1:8000";

export default defineConfig({
  base: "/6806021411279.github.io/",
  plugins: [react()],
  optimizeDeps: {
    exclude: ["onnxruntime-web"]
  },
  server: {
    port: 5173,
    proxy: {
      "/api": target,
      "/files": target
    }
  }
});
