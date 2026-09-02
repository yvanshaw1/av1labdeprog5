import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

/** Recurso solicitado nao existe. Lancada pelos services ao buscar por identificador. */
export class ResourceNotFoundException extends ApplicationException {
  constructor(resourceName: string, identifier: string) {
    super(problemTypes.resourceNotFound, 404, `${resourceName} not found with identifier ${identifier}`)
  }
}
