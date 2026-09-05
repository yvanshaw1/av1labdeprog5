/**
 * Catalogo dos tipos de problema que a API publica (campos `type` e `title` da
 * RFC 9457).
 *
 * Fica separado das classes de excecao porque nem todo problema nasce de uma
 * excecao nossa: falha do parser de corpo e erro inesperado sao detectados fora
 * do dominio, e precisam do mesmo vocabulario.
 */
export interface ProblemTypeDefinition {
  readonly type: string
  readonly title: string
}

export const problemTypes = {
  resourceNotFound: { type: "/problems/resource-not-found", title: "Resource Not Found" },
  resourceAlreadyExists: { type: "/problems/resource-already-exists", title: "Resource Already Exists" },
  resourceInUse: { type: "/problems/resource-in-use", title: "Resource In Use" },
  requestValidationFailed: { type: "/problems/request-validation-failed", title: "Request Validation Failed" },
  malformedRequestBody: { type: "/problems/malformed-request-body", title: "Malformed Request Body" },
  payloadTooLarge: { type: "/problems/payload-too-large", title: "Payload Too Large" },
  unsupportedMediaType: { type: "/problems/unsupported-media-type", title: "Unsupported Media Type" },
  methodNotAllowed: { type: "/problems/method-not-allowed", title: "Method Not Allowed" },
  routeNotFound: { type: "/problems/route-not-found", title: "Route Not Found" },
  internalServerError: { type: "/problems/internal-server-error", title: "Internal Server Error" },
} as const satisfies Record<string, ProblemTypeDefinition>
