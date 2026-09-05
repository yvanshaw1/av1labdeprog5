import type { DataSource, Repository } from "typeorm"
import { Client } from "../../models/client.entity.js"
import type { ClientRepository } from "../client.repository.js"
import { translatingConstraintViolations } from "./constraint-violation.js"

/**
 * Implementacao do contrato sobre o TypeORM.
 *
 * O ORM fica confinado a esta camada — inclusive os erros que ele levanta,
 * traduzidos aqui para excecoes da aplicacao.
 */
export class TypeOrmClientRepository implements ClientRepository {
  private readonly repository: Repository<Client>

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Client)
  }

  async save(client: Client): Promise<Client> {
    return translatingConstraintViolations(() => this.repository.save(client))
  }

  async findAll(): Promise<Client[]> {
    return this.repository.find({ order: { createdAt: "ASC" } })
  }

  async findById(id: string): Promise<Client | null> {
    return this.repository.findOneBy({ id })
  }

  async existsById(id: string): Promise<boolean> {
    return this.repository.existsBy({ id })
  }

  async deleteById(id: string): Promise<void> {
    await translatingConstraintViolations(() => this.repository.delete(id))
  }

  async findByEmail(email: string): Promise<Client | null> {
    return this.repository.findOneBy({ email })
  }
}
