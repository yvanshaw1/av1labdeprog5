import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

export class PayloadTooLargeException extends ApplicationException {
  constructor(maximumSize: string) {
    super(problemTypes.payloadTooLarge, 413, `Request body must not exceed ${maximumSize}.`)
  }
}
