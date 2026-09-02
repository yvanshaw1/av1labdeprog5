import type {
  DataSource,
  EntityTarget,
  FindOptionsOrder,
  FindOptionsWhere,
  ObjectLiteral,
  Repository,
} from "typeorm"
import type { CrudRepository } from "../crud.repository.js"
import { translatingConstraintViolations } from "./constraint-violation.js"

/**
 * Parte comum das implementacoes sobre o TypeORM: as cinco operacoes do
 * `CrudRepository` sao iguais para todo recurso, mudando apenas a entidade e a
 * ordem em que a listagem sai.
 *
 * O TypeORM fica confinado a esta camada — inclusive os erros que ele levanta,
 * traduzidos aqui para excecoes da aplicacao.
 */
export abstract class TypeOrmCrudRepository<Entity extends ObjectLiteral & { id: string }>
  implements CrudRepository<Entity>
{
  protected readonly repository: Repository<Entity>

  protected constructor(
    dataSource: DataSource,
    entity: EntityTarget<Entity>,
    private readonly listOrder: FindOptionsOrder<Entity>,
  ) {
    this.repository = dataSource.getRepository(entity)
  }

  async save(entity: Entity): Promise<Entity> {
    return translatingConstraintViolations(() => this.repository.save(entity))
  }

  async findAll(): Promise<Entity[]> {
    return this.repository.find({ order: this.listOrder })
  }

  async findById(id: string): Promise<Entity | null> {
    return this.repository.findOneBy(this.byId(id))
  }

  async existsById(id: string): Promise<boolean> {
    return this.repository.existsBy(this.byId(id))
  }

  async deleteById(id: string): Promise<void> {
    await translatingConstraintViolations(() => this.repository.delete(id))
  }

  // A restricao do parametro garante que toda entidade tem `id`, mas o
  // compilador nao consegue provar isso para o filtro de um tipo generico.
  private byId(id: string): FindOptionsWhere<Entity> {
    return { id } as FindOptionsWhere<Entity>
  }
}
