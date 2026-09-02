import type { NextFunction, Request, Response } from "express"
import { UnsupportedMediaTypeException } from "../exceptions/unsupported-media-type.exception.js"

/**
 * Recusa corpo que nao venha como JSON.
 *
 * `is` devolve `null` quando a requisicao nao traz corpo algum — esse caso
 * segue adiante de proposito, para que a falta do corpo seja reportada como
 * erro de validacao, com a lista de campos, e nao como formato invalido.
 */
export function requireJsonContentType(request: Request, _response: Response, next: NextFunction): void {
  if (request.is("application/json") === false) {
    next(new UnsupportedMediaTypeException())
    return
  }

  next()
}
