import type { NextFunction, Request, Response } from "express"
import { RouteNotFoundException } from "../exceptions/route-not-found.exception.js"

/**
 * Ultimo middleware da cadeia de rotas: se a requisicao chegou aqui, nenhuma
 * rota a atendeu. Registrar antes do handler global de excecoes.
 */
export function routeNotFoundMiddleware(request: Request, _response: Response, next: NextFunction): void {
  next(new RouteNotFoundException(request.method, request.originalUrl))
}
