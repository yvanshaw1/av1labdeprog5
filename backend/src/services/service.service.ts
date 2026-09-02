import type { CreateServiceRequestDto } from "../dtos/request/create-service.request.dto.js"
import type { UpdateServiceRequestDto } from "../dtos/request/update-service.request.dto.js"
import { ResourceAlreadyExistsException } from "../exceptions/resource-already-exists.exception.js"
import { serviceMapper } from "../mappers/service.mapper.js"
import type { Service } from "../models/service.entity.js"
import type { ServiceRepository } from "../repositories/service.repository.js"
import { CrudService } from "./crud.service.js"

/** Regras de negocio do catalogo de servicos. */
export class ServiceService extends CrudService<Service, ServiceRepository> {
  constructor(serviceRepository: ServiceRepository) {
    super(serviceRepository, "Service")
  }

  async create(requestDto: CreateServiceRequestDto): Promise<Service> {
    await this.ensureNameIsAvailable(requestDto.name)
    return this.repository.save(serviceMapper.fromCreateRequestDtoToEntity(requestDto))
  }

  async update(id: string, requestDto: UpdateServiceRequestDto): Promise<Service> {
    const existingService = await this.findById(id)
    await this.ensureNameIsAvailable(requestDto.name, id)
    return this.repository.save(serviceMapper.applyUpdateRequestDtoToEntity(existingService, requestDto))
  }

  /**
   * @param currentServiceId Na atualizacao, o proprio servico pode manter o nome;
   *                         so outro portador do mesmo nome caracteriza conflito.
   */
  private async ensureNameIsAvailable(name: string, currentServiceId?: string): Promise<void> {
    const serviceWithSameName = await this.repository.findByName(name)
    if (serviceWithSameName !== null && serviceWithSameName.id !== currentServiceId) {
      throw ResourceAlreadyExistsException.forField("Service", "name", name)
    }
  }
}
