import { ApplicationException } from "./application.exception.js"
import { problemTypes } from "./problem-types.js"

/**
 * Nenhuma rota registrada atende o metodo e o caminho pedidos.
 * Existe para que a API responda Problem Details tambem nesse caso, em vez da
 * pagina HTML padrao do Express.
 */
export class RouteNotFoundException extends ApplicationException {
  constructor(httpMethod: string, path: string) {
    super(problemTypes.routeNotFound, 404, `Route ${httpMethod} ${path} does not exist`)
  }
}
