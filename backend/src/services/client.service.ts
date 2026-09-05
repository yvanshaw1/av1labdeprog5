import type { CreateClientRequestDto } from "../dtos/request/create-client.request.dto.js"
import type { UpdateClientRequestDto } from "../dtos/request/update-client.request.dto.js"
import type { Client } from "../models/client.entity.js"

/**
 * Regras de negocio de cliente.
 *
 * O controller depende desta interface, e nao da implementacao: a fronteira
 * HTTP nao precisa saber como a regra e' cumprida, nem onde os dados moram.
 */
export interface ClientService {
  create(requestDto: CreateClientRequestDto): Promise<Client>
  findAll(): Promise<Client[]>
  findById(id: string): Promise<Client>
  update(id: string, requestDto: UpdateClientRequestDto): Promise<Client>
  delete(id: string): Promise<void>
}
