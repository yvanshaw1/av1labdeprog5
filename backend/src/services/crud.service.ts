import { ResourceNotFoundException } from "../exceptions/resource-not-found.exception.js"
import type { CrudRepository } from "../repositories/crud.repository.js"

/**
 * Parte comum aos services de recurso: listar, buscar por identificador e
 * apagar. Sao as operacoes sem regra propria — mudam apenas o repositorio e o
 * nome que aparece no erro 404.
 *
 * Criacao e atualizacao ficam em cada subclasse: e' onde moram as regras
 * (unicidade, existencia das referencias, calculo do total).
 *
 * O parametro `Repository` preserva o tipo concreto do repositorio, para que a
 * subclasse alcance os metodos proprios dele (`findByEmail`, `findAllByIds`).
 */
export abstract class CrudService<Entity, Repository extends CrudRepository<Entity>> {
  protected constructor(
    protected readonly repository: Repository,
    private readonly resourceName: string,
  ) {}

  async findAll(): Promise<Entity[]> {
    return this.repository.findAll()
  }

  async findById(id: string): Promise<Entity> {
    const entity = await this.repository.findById(id)
    if (entity === null) {
      throw new ResourceNotFoundException(this.resourceName, id)
    }
    return entity
  }

  async delete(id: string): Promise<void> {
    if (!(await this.repository.existsById(id))) {
      throw new ResourceNotFoundException(this.resourceName, id)
    }
    await this.repository.deleteById(id)
  }
}
