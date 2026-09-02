import { ApplicationException, type ProblemExtensions } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"
import type { ValidationIssue } from "./validation-issue.js"

/**
 * Corpo ou parametro da requisicao reprovado na validacao de schema.
 *
 * A conversao de erro do Zod para esta excecao acontece no
 * `validate-request.middleware.ts` — a excecao em si nao conhece o Zod.
 */
export class RequestValidationException extends ApplicationException {
  constructor(readonly issues: readonly ValidationIssue[]) {
    super(problemTypes.requestValidationFailed, 400, "Request validation failed")
  }

  override problemExtensions(): ProblemExtensions {
    return { errors: this.issues }
  }
}
