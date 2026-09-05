import type { DataSource } from "typeorm"
import type { ApplicationRepositories } from "./application.js"
import { TypeOrmClientRepository } from "./repositories/typeorm/typeorm-client.repository.js"

/**
 * Raiz de composicao da persistencia: e' o unico ponto do sistema que escolhe
 * qual implementacao de repositorio a aplicacao vai usar.
 */
export function buildTypeOrmRepositories(dataSource: DataSource): ApplicationRepositories {
  return { clientRepository: new TypeOrmClientRepository(dataSource) }
}
