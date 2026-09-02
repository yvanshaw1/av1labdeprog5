import { requestJson } from "./http.ts"

/** As quatro operações que todo recurso da API expõe. */
export interface ResourceApi<Entity, Input> {
  list(): Promise<Entity[]>
  create(input: Input): Promise<Entity>
  update(id: string, input: Input): Promise<Entity>
  remove(id: string): Promise<void>
}

/**
 * Os quatro recursos têm o mesmo contrato HTTP, então o cliente é o mesmo —
 * muda só o caminho e os tipos de entrada e saída.
 */
export function createResourceApi<Entity, Input>(resourcePath: string): ResourceApi<Entity, Input> {
  return {
    list: () => requestJson<Entity[]>(resourcePath),
    create: (input) => requestJson<Entity>(resourcePath, "POST", input),
    update: (id, input) => requestJson<Entity>(`${resourcePath}/${id}`, "PUT", input),
    remove: (id) => requestJson<void>(`${resourcePath}/${id}`, "DELETE"),
  }
}
