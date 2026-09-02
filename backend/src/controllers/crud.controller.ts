import type { RequestHandler } from "express"
import type { CrudRouteHandlers } from "../routes/crud-routes.js"
import type { ResourceIdentifierParameters } from "../routes/resource-identifier.schema.js"

/** O que o controller precisa de um service de recurso. */
export interface ResourceService<Entity> {
  create(requestDto: unknown): Promise<Entity>
  findAll(): Promise<Entity[]>
  findById(id: string): Promise<Entity>
  update(id: string, requestDto: unknown): Promise<Entity>
  delete(id: string): Promise<void>
}

/**
 * Fronteira HTTP de um recurso.
 *
 * So faz tres coisas: ler o que chegou, delegar ao service e traduzir o
 * resultado em resposta. Regra de negocio nenhuma mora aqui, e erro nenhum e'
 * tratado: a excecao sobe para o handler global.
 *
 * Os quatro recursos tem a mesma fronteira — muda apenas o service que decide e
 * o mapper que serializa —, entao ela e' descrita uma vez e instanciada quatro.
 *
 * Os metodos sao propriedades-seta para que continuem ligados a instancia
 * quando passados direto ao roteador do Express.
 */
export class CrudController<Entity extends { id: string }, ResponseDto> implements CrudRouteHandlers {
  constructor(
    private readonly service: ResourceService<Entity>,
    private readonly toResponseDto: (entity: Entity) => ResponseDto,
  ) {}

  list: RequestHandler = async (_request, response) => {
    const entities = await this.service.findAll()
    response.status(200).json(entities.map((entity) => this.toResponseDto(entity)))
  }

  findById: RequestHandler<ResourceIdentifierParameters> = async (request, response) => {
    const entity = await this.service.findById(request.params.id)
    response.status(200).json(this.toResponseDto(entity))
  }

  create: RequestHandler = async (request, response) => {
    const createdEntity = await this.service.create(request.body)
    // `baseUrl` e' o caminho onde o roteador foi montado (ex.: /api/clients), entao
    // o Location acompanha a montagem em vez de repetir o caminho aqui.
    response
      .status(201)
      .location(`${request.baseUrl}/${createdEntity.id}`)
      .json(this.toResponseDto(createdEntity))
  }

  update: RequestHandler<ResourceIdentifierParameters> = async (request, response) => {
    const updatedEntity = await this.service.update(request.params.id, request.body)
    response.status(200).json(this.toResponseDto(updatedEntity))
  }

  delete: RequestHandler<ResourceIdentifierParameters> = async (request, response) => {
    await this.service.delete(request.params.id)
    response.status(204).send()
  }
}
