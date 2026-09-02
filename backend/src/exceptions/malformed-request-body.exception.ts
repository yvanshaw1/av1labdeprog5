import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

/**
 * Corpo que nem chega a ser JSON valido — virgula faltando, chave sem aspas.
 *
 * Distinta de `RequestValidationException`: la o JSON foi lido e os campos e'
 * que falharam; aqui nao ha o que validar.
 */
export class MalformedRequestBodyException extends ApplicationException {
  constructor() {
    super(problemTypes.malformedRequestBody, 400, "Request body is not valid JSON.")
  }
}
