import type { ProblemTypeDefinition } from "./problem-types.js"
import type { ValidationIssue } from "./validation-issue.js"

/** Campos que uma excecao pode acrescentar ao corpo Problem Details. */
export interface ProblemExtensions {
  readonly errors?: readonly ValidationIssue[]
}

/**
 * Raiz de toda excecao prevista pela aplicacao.
 *
 * Cada subclasse declara na chamada a `super` como deve ser traduzida para HTTP.
 * O handler global (`middlewares/global-exception.handler.ts`) e' o unico lugar
 * que faz essa traducao — services e controllers apenas lancam a excecao.
 *
 * Os campos seguem a RFC 9457 (Problem Details for HTTP APIs):
 * `problemType` vira `type`, `title` vira `title` e `message` vira `detail`.
 */
export abstract class ApplicationException extends Error {
  readonly statusCode: number
  readonly problemType: string
  readonly title: string

  protected constructor(problem: ProblemTypeDefinition, statusCode: number, message: string) {
    super(message)
    // `new.target` resolve para a subclasse concreta, entao o nome no log e' util.
    this.name = new.target.name
    this.statusCode = statusCode
    this.problemType = problem.type
    this.title = problem.title
  }

  /**
   * Existe para que o handler global monte a resposta sem perguntar de que tipo
   * e' a excecao: quem tem algo a acrescentar sobrescreve.
   */
  problemExtensions(): ProblemExtensions {
    return {}
  }
}
