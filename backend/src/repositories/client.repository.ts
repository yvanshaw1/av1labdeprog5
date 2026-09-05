import type { Client } from "../models/client.entity.js"

/**
 * Contrato de persistencia de cliente.
 *
 * O service depende desta interface, nunca do TypeORM: e' o que permite trocar
 * a implementacao de persistencia sem tocar em regra de negocio.
 */
export interface ClientRepository {
  save(client: Client): Promise<Client>
  findAll(): Promise<Client[]>
  findById(id: string): Promise<Client | null>
  existsById(id: string): Promise<boolean>
  deleteById(id: string): Promise<void>
  /** Usado para detectar email duplicado antes de gravar. */
  findByEmail(email: string): Promise<Client | null>
}
