import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

export class UnsupportedMediaTypeException extends ApplicationException {
  constructor() {
    super(problemTypes.unsupportedMediaType, 415, "Request body must be sent as application/json.")
  }
}
