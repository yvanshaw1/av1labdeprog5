import type { CreateServiceRequestDto } from "../dtos/request/create-service.request.dto.js"
import type { UpdateServiceRequestDto } from "../dtos/request/update-service.request.dto.js"
import type { ServiceResponseDto } from "../dtos/response/service.response.dto.js"
import { Service } from "../models/service.entity.js"

export const serviceMapper = {
  fromCreateRequestDtoToEntity(requestDto: CreateServiceRequestDto): Service {
    return serviceMapper.applyUpdateRequestDtoToEntity(new Service(), requestDto)
  },

  applyUpdateRequestDtoToEntity(service: Service, requestDto: UpdateServiceRequestDto): Service {
    service.name = requestDto.name
    service.description = requestDto.description
    service.price = requestDto.price
    service.durationInMinutes = requestDto.durationInMinutes
    return service
  },

  fromEntityToResponseDto(service: Service): ServiceResponseDto {
    return {
      id: service.id,
      name: service.name,
      description: service.description,
      price: service.price,
      durationInMinutes: service.durationInMinutes,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
    }
  },
}
