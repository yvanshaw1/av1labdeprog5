import { In, type DataSource } from "typeorm"
import { Service } from "../../models/service.entity.js"
import type { ServiceRepository } from "../service.repository.js"
import { TypeOrmCrudRepository } from "./typeorm-crud.repository.js"

export class TypeOrmServiceRepository extends TypeOrmCrudRepository<Service> implements ServiceRepository {
  constructor(dataSource: DataSource) {
    super(dataSource, Service, { createdAt: "ASC" })
  }

  async findByName(name: string): Promise<Service | null> {
    return this.repository.findOneBy({ name })
  }

  async findAllByIds(ids: readonly string[]): Promise<Service[]> {
    // `In([])` gera SQL invalido em alguns drivers; a lista vazia e' resolvida aqui.
    if (ids.length === 0) {
      return []
    }
    return this.repository.findBy({ id: In([...ids]) })
  }
}
