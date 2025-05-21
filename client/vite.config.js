import tailwindcss from "@tailwindcss/vite"; // 追加
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // tailwindcss()追加
});
