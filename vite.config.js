import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const target = "http://127.0.0.1:8000";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    base: env.VITE_BASE || "/",
    plugins: [react()],
    optimizeDeps: { exclude: ["onnxruntime-web"] },
    server: { port: 5173, proxy: { "/api": target, "/files": target } },
  };
});
