import type { Client } from "../models/client.entity.js"
import type { CrudRepository } from "./crud.repository.js"

export interface ClientRepository extends CrudRepository<Client> {
  /** Usado para detectar email duplicado antes de gravar. */
  findByEmail(email: string): Promise<Client | null>
}
