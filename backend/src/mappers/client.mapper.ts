import type { CreateClientRequestDto } from "../dtos/request/create-client.request.dto.js"
import type { UpdateClientRequestDto } from "../dtos/request/update-client.request.dto.js"
import type { ClientResponseDto } from "../dtos/response/client.response.dto.js"
import { Client } from "../models/client.entity.js"

/**
 * Unico ponto de conversao entre os DTOs de cliente e a entidade.
 *
 * Manter isso fora dos controllers e services garante que a entidade nunca
 * atravesse a fronteira HTTP: o que sai da API e' sempre um DTO de resposta,
 * sem relacoes carregadas pelo ORM nem campos internos.
 */
export const clientMapper = {
  fromCreateRequestDtoToEntity(requestDto: CreateClientRequestDto): Client {
    return clientMapper.applyUpdateRequestDtoToEntity(new Client(), requestDto)
  },

  applyUpdateRequestDtoToEntity(client: Client, requestDto: UpdateClientRequestDto): Client {
    client.fullName = requestDto.fullName
    client.email = requestDto.email
    client.phoneNumber = requestDto.phoneNumber
    return client
  },

  fromEntityToResponseDto(client: Client): ClientResponseDto {
    return {
      id: client.id,
      fullName: client.fullName,
      email: client.email,
      phoneNumber: client.phoneNumber,
      createdAt: client.createdAt.toISOString(),
      updatedAt: client.updatedAt.toISOString(),
    }
  },
}
