/**
 * Contrato comum a todos os repositorios.
 *
 * As camadas de cima (services) dependem desta interface, nunca do TypeORM.
 * E' o que permite trocar a implementacao de persistencia sem tocar no dominio.
 */
export interface CrudRepository<Entity> {
  save(entity: Entity): Promise<Entity>
  findAll(): Promise<Entity[]>
  findById(id: string): Promise<Entity | null>
  existsById(id: string): Promise<boolean>
  deleteById(id: string): Promise<void>
}
