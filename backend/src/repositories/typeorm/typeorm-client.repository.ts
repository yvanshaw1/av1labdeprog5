import type { DataSource } from "typeorm"
import { Client } from "../../models/client.entity.js"
import type { ClientRepository } from "../client.repository.js"
import { TypeOrmCrudRepository } from "./typeorm-crud.repository.js"

export class TypeOrmClientRepository extends TypeOrmCrudRepository<Client> implements ClientRepository {
  constructor(dataSource: DataSource) {
    super(dataSource, Client, { createdAt: "ASC" })
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.repository.findOneBy({ email })
  }
}
