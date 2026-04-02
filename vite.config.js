import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.TAURI_ENV_PLATFORM ? "./" : (process.env.VITE_BASE_PATH || "/"),
  plugins: [react()],
  optimizeDeps: {
    include: ["tslib"],
  },
  resolve: {
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
});
