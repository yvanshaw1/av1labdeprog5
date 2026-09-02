import { Router } from "express"

/** Nao toca no banco de proposito: responde se o processo esta no ar, nao se ele consegue servir. */
export function buildHealthRoutes(): Router {
  const router = Router()

  router.get("/", (_request, response) => {
    response.status(200).json({ status: "ok", uptimeInSeconds: Math.round(process.uptime()) })
  })

  return router
}
