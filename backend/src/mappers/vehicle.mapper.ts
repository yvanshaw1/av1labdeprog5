import type { CreateVehicleRequestDto } from "../dtos/request/create-vehicle.request.dto.js"
import type { UpdateVehicleRequestDto } from "../dtos/request/update-vehicle.request.dto.js"
import type { VehicleResponseDto } from "../dtos/response/vehicle.response.dto.js"
import { Vehicle } from "../models/vehicle.entity.js"

export const vehicleMapper = {
  fromCreateRequestDtoToEntity(requestDto: CreateVehicleRequestDto): Vehicle {
    const vehicle = new Vehicle()
    vehicle.clientId = requestDto.clientId
    return vehicleMapper.applyUpdateRequestDtoToEntity(vehicle, requestDto)
  },

  // O dono nao entra aqui: `clientId` fica de fora do DTO de atualizacao.
  applyUpdateRequestDtoToEntity(vehicle: Vehicle, requestDto: UpdateVehicleRequestDto): Vehicle {
    vehicle.licensePlate = requestDto.licensePlate
    vehicle.make = requestDto.make
    vehicle.model = requestDto.model
    vehicle.manufactureYear = requestDto.manufactureYear
    vehicle.color = requestDto.color
    return vehicle
  },

  fromEntityToResponseDto(vehicle: Vehicle): VehicleResponseDto {
    return {
      id: vehicle.id,
      licensePlate: vehicle.licensePlate,
      make: vehicle.make,
      model: vehicle.model,
      manufactureYear: vehicle.manufactureYear,
      color: vehicle.color,
      clientId: vehicle.clientId,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    }
  },
}
