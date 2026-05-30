import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/live-assistant/",
  server: {
    host: "127.0.0.1",
  },
});
