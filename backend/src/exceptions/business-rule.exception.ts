import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

/**
 * Requisicao bem formada, mas que viola uma regra do dominio
 * (ex.: o veiculo informado nao pertence ao cliente do agendamento).
 */
export class BusinessRuleException extends ApplicationException {
  constructor(message: string) {
    super(problemTypes.businessRuleViolation, 422, message)
  }
}
