import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Encaminha as chamadas para a API em desenvolvimento, evitando CORS.
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
})
