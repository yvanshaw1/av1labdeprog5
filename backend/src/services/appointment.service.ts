import type { CreateAppointmentRequestDto } from "../dtos/request/create-appointment.request.dto.js"
import type { UpdateAppointmentRequestDto } from "../dtos/request/update-appointment.request.dto.js"
import { BusinessRuleException } from "../exceptions/business-rule.exception.js"
import { ResourceNotFoundException } from "../exceptions/resource-not-found.exception.js"
import { appointmentMapper } from "../mappers/appointment.mapper.js"
import type { Appointment } from "../models/appointment.entity.js"
import type { Service } from "../models/service.entity.js"
import type { AppointmentRepository } from "../repositories/appointment.repository.js"
import type { ClientRepository } from "../repositories/client.repository.js"
import type { ServiceRepository } from "../repositories/service.repository.js"
import type { VehicleRepository } from "../repositories/vehicle.repository.js"
import { CrudService } from "./crud.service.js"

const CENTS_IN_ONE_REAL = 100

/** Soma valores em reais sem arrastar residuo de ponto flutuante (0.1 + 0.2). */
function sumAmountsInReais(amounts: readonly number[]): number {
  const total = amounts.reduce((sum, amount) => sum + amount, 0)
  return Math.round(total * CENTS_IN_ONE_REAL) / CENTS_IN_ONE_REAL
}

export interface AppointmentServiceDependencies {
  readonly appointmentRepository: AppointmentRepository
  readonly clientRepository: ClientRepository
  readonly vehicleRepository: VehicleRepository
  readonly serviceRepository: ServiceRepository
}

export class AppointmentService extends CrudService<Appointment, AppointmentRepository> {
  private readonly clientRepository: ClientRepository
  private readonly vehicleRepository: VehicleRepository
  private readonly serviceRepository: ServiceRepository

  constructor(dependencies: AppointmentServiceDependencies) {
    super(dependencies.appointmentRepository, "Appointment")
    this.clientRepository = dependencies.clientRepository
    this.vehicleRepository = dependencies.vehicleRepository
    this.serviceRepository = dependencies.serviceRepository
  }

  async create(requestDto: CreateAppointmentRequestDto): Promise<Appointment> {
    if (!(await this.clientRepository.existsById(requestDto.clientId))) {
      throw new ResourceNotFoundException("Client", requestDto.clientId)
    }
    await this.ensureVehicleBelongsToClient(requestDto.vehicleId, requestDto.clientId)
    const services = await this.findServicesInRequestedOrder(requestDto.serviceIds)

    const appointment = appointmentMapper.fromCreateRequestDtoToEntity(requestDto)
    return this.repository.save(this.applyServices(appointment, services))
  }

  async update(id: string, requestDto: UpdateAppointmentRequestDto): Promise<Appointment> {
    const existingAppointment = await this.findById(id)
    // O dono do agendamento nao muda no PUT, entao o veiculo novo precisa ser dele.
    await this.ensureVehicleBelongsToClient(requestDto.vehicleId, existingAppointment.clientId)
    const services = await this.findServicesInRequestedOrder(requestDto.serviceIds)

    const appointment = appointmentMapper.applyUpdateRequestDtoToEntity(existingAppointment, requestDto)
    return this.repository.save(this.applyServices(appointment, services))
  }

  /**
   * Monta os itens e os totais a partir do catalogo.
   *
   * Este e' o ponto que garante que o valor cobrado nunca venha do cliente:
   * preco e duracao saem sempre da entidade Service carregada do banco.
   */
  private applyServices(appointment: Appointment, services: readonly Service[]): Appointment {
    appointment.items = services.map((service) => appointmentMapper.fromServiceToAppointmentItem(service))
    appointment.totalPrice = sumAmountsInReais(appointment.items.map((item) => item.bookedPrice))
    appointment.totalDurationInMinutes = appointment.items.reduce(
      (total, item) => total + item.bookedDurationInMinutes,
      0,
    )
    return appointment
  }

  private async ensureVehicleBelongsToClient(vehicleId: string, clientId: string): Promise<void> {
    const vehicle = await this.vehicleRepository.findById(vehicleId)
    if (vehicle === null) {
      throw new ResourceNotFoundException("Vehicle", vehicleId)
    }
    if (vehicle.clientId !== clientId) {
      throw new BusinessRuleException("The informed vehicle does not belong to the informed client.")
    }
  }

  /**
   * Devolve os servicos na ordem em que foram pedidos — o repositorio pode
   * entregar em qualquer ordem — e falha no primeiro identificador inexistente.
   */
  private async findServicesInRequestedOrder(serviceIds: readonly string[]): Promise<Service[]> {
    const foundServices = await this.serviceRepository.findAllByIds(serviceIds)
    const servicesById = new Map(foundServices.map((service) => [service.id, service]))

    return serviceIds.map((serviceId) => {
      const service = servicesById.get(serviceId)
      if (service === undefined) {
        throw new ResourceNotFoundException("Service", serviceId)
      }
      return service
    })
  }
}
