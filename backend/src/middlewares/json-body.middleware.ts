import express, { type ErrorRequestHandler, type RequestHandler } from "express"
import { MalformedRequestBodyException } from "../exceptions/malformed-request-body.exception.js"
import { PayloadTooLargeException } from "../exceptions/payload-too-large.exception.js"

const MAXIMUM_BODY_SIZE = "100kb"

export const jsonBodyParser: RequestHandler = express.json({ limit: MAXIMUM_BODY_SIZE })

/**
 * Traduz as falhas do parser de corpo em excecoes da aplicacao.
 *
 * O parser sinaliza erro no estilo do Express, que o handler global nao
 * reconhece: sem esta traducao, uma virgula faltando no JSON do cliente vira
 * 500 — a API assumindo a culpa por um erro que nao e' dela, e poluindo o log
 * de falhas de servidor.
 *
 * Registrar imediatamente depois de `jsonBodyParser`.
 */
export const jsonBodyFailureTranslator: ErrorRequestHandler = (error, _request, _response, next) => {
  const failureType = (error as { type?: unknown }).type

  if (failureType === "entity.too.large") {
    next(new PayloadTooLargeException(MAXIMUM_BODY_SIZE))
    return
  }

  if (failureType === "entity.parse.failed") {
    next(new MalformedRequestBodyException())
    return
  }

  next(error)
}
