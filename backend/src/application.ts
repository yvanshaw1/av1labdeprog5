import express, { type Express } from "express"
import { ClientController } from "./controllers/client.controller.js"
import { globalExceptionHandler } from "./middlewares/global-exception.handler.js"
import { jsonBodyFailureTranslator, jsonBodyParser } from "./middlewares/json-body.middleware.js"
import { routeNotFoundMiddleware } from "./middlewares/route-not-found.middleware.js"
import { buildWebAppRoutes } from "./middlewares/web-app.middleware.js"
import type { ClientRepository } from "./repositories/client.repository.js"
import { buildClientRoutes } from "./routes/client-routes.js"
import { buildHealthRoutes } from "./routes/health-routes.js"
import { ClientServiceImpl } from "./services/impl/client.service.impl.js"

/**
 * Repositorios que a aplicacao precisa para funcionar.
 *
 * Recebe-los de fora e' o que mantem a montagem independente da persistencia:
 * quem escolhe a implementacao e' o `container.ts`.
 */
export interface ApplicationRepositories {
  readonly clientRepository: ClientRepository
}

/**
 * Composicao das camadas e montagem da aplicacao Express.
 *
 * Nao abre porta de proposito: quem escuta e' o `server.ts`.
 *
 * @param webAppDirectory Pasta da interface compilada. Informada, a aplicacao
 *                        serve API e site na mesma porta; omitida, so a API.
 */
export function createApplication(repositories: ApplicationRepositories, webAppDirectory?: string): Express {
  const clientService = new ClientServiceImpl(repositories.clientRepository)
  const clientController = new ClientController(clientService)

  const application = express()
  application.use(jsonBodyParser)
  // Logo depois do parser, para traduzir as falhas dele antes de qualquer rota.
  application.use(jsonBodyFailureTranslator)

  application.use("/health", buildHealthRoutes())
  application.use("/api/clients", buildClientRoutes(clientController))

  // Depois da API: a interface so responde nos caminhos que a API nao atende.
  if (webAppDirectory !== undefined) {
    application.use(buildWebAppRoutes(webAppDirectory))
  }

  // A ordem importa: rota nao encontrada primeiro, handler de excecao por ultimo.
  application.use(routeNotFoundMiddleware)
  application.use(globalExceptionHandler)

  return application
}
