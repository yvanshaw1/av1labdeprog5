import type { NextFunction, Request, RequestHandler, Response } from "express"
import type { ZodError, ZodType } from "zod"
import { RequestValidationException } from "../exceptions/request-validation.exception.js"

/**
 * Converte o erro do Zod na excecao que o handler global publica.
 * O Zod e' detalhe de implementacao: fora daqui, so circula ValidationIssue.
 */
function toValidationException(error: ZodError): RequestValidationException {
  return new RequestValidationException(
    error.issues.map((issue) => ({
      // Caminho vazio significa erro do objeto inteiro (ex.: chave desconhecida).
      field: issue.path.length > 0 ? issue.path.join(".") : "body",
      message: issue.message,
    })),
  )
}

/**
 * Valida o corpo da requisicao e o substitui pelo dado ja convertido — a partir
 * daqui o controller trabalha com o DTO tipado, sem repetir validacao.
 */
export function validateRequestBody(schema: ZodType): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(request.body)

    if (!parseResult.success) {
      next(toValidationException(parseResult.error))
      return
    }

    request.body = parseResult.data
    next()
  }
}

/**
 * Valida os parametros de rota (o `:id` das rotas de recurso).
 *
 * Diferente do corpo, `request.params` nao e' sobrescrito: no Express 5 ele e'
 * resolvido pelo roteador, e a validacao aqui serve para recusar identificador
 * malformado antes que ele chegue ao banco.
 */
export function validateRequestParameters(schema: ZodType): RequestHandler {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const parseResult = schema.safeParse(request.params)

    if (!parseResult.success) {
      next(toValidationException(parseResult.error))
      return
    }

    next()
  }
}
