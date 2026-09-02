import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

/**
 * Caminho existe, mas nao atende esse verbo. Diferente de rota inexistente:
 * a resposta acompanha o cabecalho `Allow` dizendo o que a rota aceita.
 */
export class MethodNotAllowedException extends ApplicationException {
  constructor(httpMethod: string, allowedMethods: string) {
    super(problemTypes.methodNotAllowed, 405, `Method ${httpMethod} is not allowed here. Allowed: ${allowedMethods}.`)
  }
}
