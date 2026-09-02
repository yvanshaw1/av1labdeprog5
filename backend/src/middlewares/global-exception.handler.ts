import type { NextFunction, Request, Response } from "express"
import { ApplicationException } from "../exceptions/application.exception.js"
import { problemTypes } from "../exceptions/problem-types.js"
import type { ProblemDetailResponseDto } from "../dtos/response/problem-detail.response.dto.js"

const PROBLEM_DETAIL_CONTENT_TYPE = "application/problem+json"

/**
 * Ponto unico de traducao de excecao para resposta HTTP.
 *
 * Excecoes previstas (`ApplicationException`) viram o status e a mensagem que
 * declararam — inclusive as que nascem de restricao do banco, ja traduzidas no
 * repositorio. Qualquer outro erro vira 500 com mensagem generica: mensagem de
 * driver e stack descrevem a estrutura interna do sistema e nao devem chegar ao
 * cliente — vao apenas para o log.
 *
 * Registrar por ultimo, depois de todas as rotas e do routeNotFoundMiddleware.
 * O quarto parametro e' obrigatorio: e' por ele que o Express reconhece um
 * middleware de erro, mesmo sem uso.
 */
export function globalExceptionHandler(
  error: unknown,
  request: Request,
  response: Response,
  _next: NextFunction,
): void {
  const problemDetail = toProblemDetail(error, request.originalUrl)

  if (problemDetail.status >= 500) {
    logServerFailure(error, request, problemDetail.status)
  }

  response.status(problemDetail.status).type(PROBLEM_DETAIL_CONTENT_TYPE).json(problemDetail)
}

function toProblemDetail(error: unknown, instance: string): ProblemDetailResponseDto {
  if (error instanceof ApplicationException) {
    return {
      type: error.problemType,
      title: error.title,
      status: error.statusCode,
      detail: error.message,
      instance,
      ...error.problemExtensions(),
    }
  }

  return {
    ...problemTypes.internalServerError,
    status: 500,
    detail: "An unexpected error occurred.",
    instance,
  }
}

function logServerFailure(error: unknown, request: Request, status: number): void {
  console.error(
    JSON.stringify({
      level: "error",
      status,
      method: request.method,
      path: request.originalUrl,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    }),
  )
}
