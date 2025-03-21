import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/dashboard/",
  plugins: [react()],
  server: {
    port: 5174, // שימוש בפורט אחר במקרה שפורט 5173 תפוס
    host: true,
  },
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
