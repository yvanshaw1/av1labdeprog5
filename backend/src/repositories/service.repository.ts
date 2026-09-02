import type { Service } from "../models/service.entity.js"
import type { CrudRepository } from "./crud.repository.js"

export interface ServiceRepository extends CrudRepository<Service> {
  /** Usado para detectar nome duplicado no catalogo antes de gravar. */
  findByName(name: string): Promise<Service | null>

  /**
   * Carrega de uma vez os servicos escolhidos num agendamento.
   * Retorna apenas os encontrados — quem chama compara com o que pediu para
   * saber quais identificadores nao existem.
   */
  findAllByIds(ids: readonly string[]): Promise<Service[]>
}
