import type { CreateClientRequestDto } from "../dtos/request/create-client.request.dto.js"
import type { UpdateClientRequestDto } from "../dtos/request/update-client.request.dto.js"
import { ResourceAlreadyExistsException } from "../exceptions/resource-already-exists.exception.js"
import { clientMapper } from "../mappers/client.mapper.js"
import type { Client } from "../models/client.entity.js"
import type { ClientRepository } from "../repositories/client.repository.js"
import { CrudService } from "./crud.service.js"

/**
 * Regras de negocio de cliente.
 *
 * Depende da interface `ClientRepository`, nao do TypeORM: e' o que permite
 * trocar a persistencia sem tocar na regra.
 */
export class ClientService extends CrudService<Client, ClientRepository> {
  constructor(clientRepository: ClientRepository) {
    super(clientRepository, "Client")
  }

  async create(requestDto: CreateClientRequestDto): Promise<Client> {
    await this.ensureEmailIsAvailable(requestDto.email)
    return this.repository.save(clientMapper.fromCreateRequestDtoToEntity(requestDto))
  }

  async update(id: string, requestDto: UpdateClientRequestDto): Promise<Client> {
    const existingClient = await this.findById(id)
    await this.ensureEmailIsAvailable(requestDto.email, id)
    return this.repository.save(clientMapper.applyUpdateRequestDtoToEntity(existingClient, requestDto))
  }

  /**
   * @param currentClientId Na atualizacao, o proprio cliente pode manter o email;
   *                        so outro dono do mesmo email caracteriza conflito.
   */
  private async ensureEmailIsAvailable(email: string, currentClientId?: string): Promise<void> {
    const clientWithSameEmail = await this.repository.findByEmail(email)
    if (clientWithSameEmail !== null && clientWithSameEmail.id !== currentClientId) {
      throw ResourceAlreadyExistsException.forField("Client", "email", email)
    }
  }
}
