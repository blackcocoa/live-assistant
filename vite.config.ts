import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? "/live-assistant/" : "/",
  server: {
    host: "127.0.0.1",
  },
}));
