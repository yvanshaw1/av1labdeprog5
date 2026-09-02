import { Router, type RequestHandler } from "express"
import type { ZodType } from "zod"
import { MethodNotAllowedException } from "../exceptions/method-not-allowed.exception.js"
import { requireJsonContentType } from "../middlewares/require-json-content-type.middleware.js"
import {
  validateRequestBody,
  validateRequestParameters,
} from "../middlewares/validate-request.middleware.js"
import { resourceIdentifierSchema, type ResourceIdentifierParameters } from "./resource-identifier.schema.js"

/** Os cinco handlers que o controller de um recurso expoe ao roteador. */
export interface CrudRouteHandlers {
  list: RequestHandler
  findById: RequestHandler<ResourceIdentifierParameters>
  create: RequestHandler
  update: RequestHandler<ResourceIdentifierParameters>
  delete: RequestHandler<ResourceIdentifierParameters>
}

interface CrudRouteSchemas {
  readonly createRequestSchema: ZodType
  readonly updateRequestSchema: ZodType
}

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

/**
 * Monta as rotas de um recurso REST.
 *
 * Os quatro recursos tem exatamente o mesmo desenho — muda so o controller e os
 * schemas de validacao. Descrever isso uma vez evita que os recursos divirjam em
 * silencio (um esquecer de validar o `:id`, por exemplo).
 */
export function buildCrudRoutes(controller: CrudRouteHandlers, schemas: CrudRouteSchemas): Router {
  const router = Router()
  const validateIdentifier = validateRequestParameters(resourceIdentifierSchema)

  router.get("/", controller.list)
  router.post("/", requireJsonContentType, validateRequestBody(schemas.createRequestSchema), controller.create)
  router.all("/", rejectOtherMethods(COLLECTION_METHODS))

  router.get("/:id", validateIdentifier, controller.findById)
  router.put(
    "/:id",
    validateIdentifier,
    requireJsonContentType,
    validateRequestBody(schemas.updateRequestSchema),
    controller.update,
  )
  router.delete("/:id", validateIdentifier, controller.delete)
  router.all("/:id", rejectOtherMethods(ITEM_METHODS))

  return router
}
