import { Router, type RequestHandler } from "express"
import type { ClientController } from "../controllers/client.controller.js"
import { createClientRequestSchema } from "../dtos/request/create-client.request.dto.js"
import { updateClientRequestSchema } from "../dtos/request/update-client.request.dto.js"
import { MethodNotAllowedException } from "../exceptions/method-not-allowed.exception.js"
import { requireJsonContentType } from "../middlewares/require-json-content-type.middleware.js"
import { validateRequestBody, validateRequestParameters } from "../middlewares/validate-request.middleware.js"
import { resourceIdentifierSchema } from "./resource-identifier.schema.js"

const COLLECTION_METHODS = ["GET", "POST", "OPTIONS"]
const ITEM_METHODS = ["GET", "PUT", "DELETE", "OPTIONS"]

/**
 * Fecha o caminho para os verbos que ele nao atende.
 *
 * Sem isto, um PATCH num caminho existente cairia no middleware de rota
 * inexistente e responderia 404, dizendo que o recurso nao existe quando o
 * problema e' o verbo. O `Allow` informa o que a rota aceita.
 */
function rejectOtherMethods(allowedMethods: readonly string[]): RequestHandler {
  const allowHeader = allowedMethods.join(", ")

  return (request, response, next) => {
    response.set("Allow", allowHeader)

    if (request.method === "OPTIONS") {
      response.status(204).send()
      return
    }

    next(new MethodNotAllowedException(request.method, allowHeader))
  }
}

/** As cinco rotas do recurso cliente, com a validacao encadeada na ordem certa. */
export function buildClientRoutes(controller: ClientController): Router {
  const router = Router()
  const validateIdentifier = validateRequestParameters(resourceIdentifierSchema)

  router.get("/", controller.list)
  router.post("/", requireJsonContentType, validateRequestBody(createClientRequestSchema), controller.create)
  router.all("/", rejectOtherMethods(COLLECTION_METHODS))

  router.get("/:id", validateIdentifier, controller.findById)
  router.put(
    "/:id",
    validateIdentifier,
    requireJsonContentType,
    validateRequestBody(updateClientRequestSchema),
    controller.update,
  )
  router.delete("/:id", validateIdentifier, controller.delete)
  router.all("/:id", rejectOtherMethods(ITEM_METHODS))

  return router
}
