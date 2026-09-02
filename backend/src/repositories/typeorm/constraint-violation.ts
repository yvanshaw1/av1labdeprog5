import { QueryFailedError } from "typeorm"
import type { ApplicationException } from "../../exceptions/application.exception.js"
import { ResourceAlreadyExistsException } from "../../exceptions/resource-already-exists.exception.js"
import { ResourceInUseException } from "../../exceptions/resource-in-use.exception.js"

const UNIQUE_VIOLATION = "23505"
const FOREIGN_KEY_VIOLATION = "23503"

// Sao conflito de dados, e nao falha do servidor. Os services checam antes de
// gravar; isto cobre o que escapa por concorrencia ou por restricao que so o
// banco conhece.
const EXCEPTION_BY_ERROR_CODE: Record<string, () => ApplicationException> = {
  [UNIQUE_VIOLATION]: () => new ResourceAlreadyExistsException(),
  [FOREIGN_KEY_VIOLATION]: () => new ResourceInUseException(),
}

function toApplicationException(error: unknown): unknown {
  if (!(error instanceof QueryFailedError)) {
    return error
  }

  const errorCode = (error.driverError as { code?: unknown } | undefined)?.code
  const buildException = typeof errorCode === "string" ? EXCEPTION_BY_ERROR_CODE[errorCode] : undefined
  return buildException === undefined ? error : buildException()
}

/**
 * Traduz violacao de restricao do banco em excecao da aplicacao.
 *
 * Fica aqui, e nao no handler global, porque `QueryFailedError` e os codigos do
 * PostgreSQL sao detalhe do TypeORM: quem esta acima do repositorio nao deve
 * saber qual banco existe do outro lado. Para as camadas de cima, uma gravacao
 * que colide levanta a mesma excecao que a regra de negocio levantaria.
 */
export async function translatingConstraintViolations<Result>(operation: () => Promise<Result>): Promise<Result> {
  try {
    return await operation()
  } catch (error) {
    throw toApplicationException(error)
  }
}
