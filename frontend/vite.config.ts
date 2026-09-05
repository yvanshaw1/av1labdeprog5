import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import { sourceCatalogPlugin } from "./vite-source-catalog.ts"

// `fileURLToPath` e nao `URL.pathname`: no Windows o segundo devolve "/C:/..."
// e o caminho acaba com o drive duplicado.
const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url))

export default defineConfig({
  // O projeto inteiro fica um nivel acima: a interface mostra tambem o backend.
  plugins: [react(), sourceCatalogPlugin(PROJECT_ROOT)],
  server: {
    port: 5173,
    // Encaminha as chamadas para a API em desenvolvimento, evitando CORS.
    proxy: {
      "/api": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
})
