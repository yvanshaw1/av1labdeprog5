import express, { Router } from "express"
import { existsSync } from "node:fs"
import { join } from "node:path"

const ENTRY_FILE = "index.html"

/**
 * Serve a interface ja compilada no mesmo servidor da API — e' o que permite
 * demonstrar o sistema inteiro numa porta so.
 *
 * Se a interface nao foi compilada, devolve um roteador vazio e a API segue
 * sozinha: em desenvolvimento quem serve o front e' o Vite, com recarga
 * automatica, numa porta propria.
 */
export function buildWebAppRoutes(webAppDirectory: string): Router {
  const router = Router()
  const entryFile = join(webAppDirectory, ENTRY_FILE)

  if (!existsSync(entryFile)) {
    return router
  }

  router.use(express.static(webAppDirectory))

  // Todo caminho que nao seja da API devolve a pagina: a navegacao acontece no
  // navegador. O recorte de `/api` importa para que uma rota inexistente da API
  // continue respondendo 404 em Problem Details, e nao a pagina HTML.
  router.get(/^\/(?!api(?:\/|$)).*/, (_request, response) => {
    response.sendFile(entryFile)
  })

  return router
}
