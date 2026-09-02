import type { CreateVehicleRequestDto } from "../dtos/request/create-vehicle.request.dto.js"
import type { UpdateVehicleRequestDto } from "../dtos/request/update-vehicle.request.dto.js"
import { ResourceAlreadyExistsException } from "../exceptions/resource-already-exists.exception.js"
import { ResourceNotFoundException } from "../exceptions/resource-not-found.exception.js"
import { vehicleMapper } from "../mappers/vehicle.mapper.js"
import type { Vehicle } from "../models/vehicle.entity.js"
import type { ClientRepository } from "../repositories/client.repository.js"
import type { VehicleRepository } from "../repositories/vehicle.repository.js"
import { CrudService } from "./crud.service.js"

export class VehicleService extends CrudService<Vehicle, VehicleRepository> {
  constructor(
    vehicleRepository: VehicleRepository,
    private readonly clientRepository: ClientRepository,
  ) {
    super(vehicleRepository, "Vehicle")
  }

  async create(requestDto: CreateVehicleRequestDto): Promise<Vehicle> {
    if (!(await this.clientRepository.existsById(requestDto.clientId))) {
      throw new ResourceNotFoundException("Client", requestDto.clientId)
    }
    await this.ensureLicensePlateIsAvailable(requestDto.licensePlate)
    return this.repository.save(vehicleMapper.fromCreateRequestDtoToEntity(requestDto))
  }

  async update(id: string, requestDto: UpdateVehicleRequestDto): Promise<Vehicle> {
    const existingVehicle = await this.findById(id)
    await this.ensureLicensePlateIsAvailable(requestDto.licensePlate, id)
    return this.repository.save(vehicleMapper.applyUpdateRequestDtoToEntity(existingVehicle, requestDto))
  }

  /**
   * @param currentVehicleId Na atualizacao, o proprio veiculo pode manter a placa;
   *                         so outro portador da mesma placa caracteriza conflito.
   */
  private async ensureLicensePlateIsAvailable(licensePlate: string, currentVehicleId?: string): Promise<void> {
    const vehicleWithSamePlate = await this.repository.findByLicensePlate(licensePlate)
    if (vehicleWithSamePlate !== null && vehicleWithSamePlate.id !== currentVehicleId) {
      throw ResourceAlreadyExistsException.forField("Vehicle", "licensePlate", licensePlate)
    }
  }
}
