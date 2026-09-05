import type { CreateClientRequestDto } from "../../dtos/request/create-client.request.dto.js"
import type { UpdateClientRequestDto } from "../../dtos/request/update-client.request.dto.js"
import { ResourceAlreadyExistsException } from "../../exceptions/resource-already-exists.exception.js"
import { ResourceNotFoundException } from "../../exceptions/resource-not-found.exception.js"
import { clientMapper } from "../../mappers/client.mapper.js"
import type { Client } from "../../models/client.entity.js"
import type { ClientRepository } from "../../repositories/client.repository.js"
import type { ClientService } from "../client.service.js"

const RESOURCE_NAME = "Client"

export class ClientServiceImpl implements ClientService {
  constructor(private readonly clientRepository: ClientRepository) {}

  async create(requestDto: CreateClientRequestDto): Promise<Client> {
    await this.ensureEmailIsAvailable(requestDto.email)
    return this.clientRepository.save(clientMapper.fromCreateRequestDtoToEntity(requestDto))
  }

  async findAll(): Promise<Client[]> {
    return this.clientRepository.findAll()
  }

  async findById(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id)
    if (client === null) {
      throw new ResourceNotFoundException(RESOURCE_NAME, id)
    }
    return client
  }

  async update(id: string, requestDto: UpdateClientRequestDto): Promise<Client> {
    const existingClient = await this.findById(id)
    await this.ensureEmailIsAvailable(requestDto.email, id)
    return this.clientRepository.save(clientMapper.applyUpdateRequestDtoToEntity(existingClient, requestDto))
  }

  async delete(id: string): Promise<void> {
    if (!(await this.clientRepository.existsById(id))) {
      throw new ResourceNotFoundException(RESOURCE_NAME, id)
    }
    await this.clientRepository.deleteById(id)
  }

  /**
   * @param currentClientId Na atualizacao, o proprio cliente pode manter o email;
   *                        so outro dono do mesmo email caracteriza conflito.
   */
  private async ensureEmailIsAvailable(email: string, currentClientId?: string): Promise<void> {
    const clientWithSameEmail = await this.clientRepository.findByEmail(email)
    if (clientWithSameEmail !== null && clientWithSameEmail.id !== currentClientId) {
      throw ResourceAlreadyExistsException.forField(RESOURCE_NAME, "email", email)
    }
  }
}
