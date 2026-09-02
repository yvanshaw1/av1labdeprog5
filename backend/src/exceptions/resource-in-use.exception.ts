import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

/**
 * Registro que nao pode ser removido porque outro recurso ainda o referencia
 * (apagar um cliente que tem veiculos, um servico que esta num agendamento).
 *
 * Diferente das demais, nasce de uma restricao que so o banco conhece: e' a
 * chave estrangeira que recusa a remocao.
 */
export class ResourceInUseException extends ApplicationException {
  constructor(message = "The record is referenced by another resource and cannot be removed.") {
    super(problemTypes.resourceInUse, 409, message)
  }
}
