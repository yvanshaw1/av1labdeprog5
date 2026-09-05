import type { Request, RequestHandler, Response } from "express"
import { clientMapper } from "../mappers/client.mapper.js"
import type { ResourceIdentifierParameters } from "../routes/resource-identifier.schema.js"
import type { ClientService } from "../services/client.service.js"

/**
 * Fronteira HTTP do recurso cliente.
 *
 * So faz tres coisas: ler o que chegou, delegar ao service e traduzir o
 * resultado em resposta. Regra de negocio nenhuma mora aqui, e erro nenhum e'
 * tratado: a excecao sobe para o handler global.
 *
 * Os metodos sao propriedades-seta para que continuem ligados a instancia
 * quando passados direto ao roteador do Express.
 */
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  list: RequestHandler = async (_request: Request, response: Response) => {
    const clients = await this.clientService.findAll()
    response.status(200).json(clients.map(clientMapper.fromEntityToResponseDto))
  }

  findById: RequestHandler<ResourceIdentifierParameters> = async (request, response) => {
    const client = await this.clientService.findById(request.params.id)
    response.status(200).json(clientMapper.fromEntityToResponseDto(client))
  }

  create: RequestHandler = async (request, response) => {
    const createdClient = await this.clientService.create(request.body)
    // `baseUrl` e' o caminho onde o roteador foi montado (/api/clients), entao o
    // Location acompanha a montagem em vez de repetir o caminho aqui.
    response
      .status(201)
      .location(`${request.baseUrl}/${createdClient.id}`)
      .json(clientMapper.fromEntityToResponseDto(createdClient))
  }

  update: RequestHandler<ResourceIdentifierParameters> = async (request, response) => {
    const updatedClient = await this.clientService.update(request.params.id, request.body)
    response.status(200).json(clientMapper.fromEntityToResponseDto(updatedClient))
  }

  delete: RequestHandler<ResourceIdentifierParameters> = async (request, response) => {
    await this.clientService.delete(request.params.id)
    response.status(204).send()
  }
}
