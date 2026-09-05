import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type { Plugin } from "vite"

const VIRTUAL_MODULE_ID = "virtual:source-catalog"
const RESOLVED_ID = `\0${VIRTUAL_MODULE_ID}`

interface SourceGroupSpec {
  label: string
  paths: string[]
}

/**
 * Os grupos sao nomeados pelos criterios do enunciado, e nao pelas pastas:
 * quem avalia procura "onde esta o Mapper", nao "o que tem em dtos/".
 */
const CATALOG_GROUPS: SourceGroupSpec[] = [
  {
    label: "Model — entidade e regras de negócio",
    paths: ["backend/src/models/client.entity.ts", "backend/src/services/client.service.ts"],
  },
  {
    label: "DTO e Mapper",
    paths: [
      "backend/src/dtos/request/create-client.request.dto.ts",
      "backend/src/dtos/request/update-client.request.dto.ts",
      "backend/src/dtos/response/client.response.dto.ts",
      "backend/src/mappers/client.mapper.ts",
    ],
  },
  {
    label: "Repository — contrato e implementação",
    paths: [
      "backend/src/repositories/client.repository.ts",
      "backend/src/repositories/crud.repository.ts",
      "backend/src/repositories/typeorm/typeorm-client.repository.ts",
      "backend/src/repositories/typeorm/typeorm-crud.repository.ts",
    ],
  },
  {
    label: "MVC — Controller e verbos HTTP",
    paths: [
      "backend/src/controllers/crud.controller.ts",
      "backend/src/routes/crud-routes.ts",
      "backend/src/routes/resource-identifier.schema.ts",
      "backend/src/services/crud.service.ts",
      "backend/src/application.ts",
      "backend/src/container.ts",
    ],
  },
  {
    label: "ORM — conexão e migration",
    paths: ["backend/src/config/data-source.ts", "backend/src/migrations/1788569946863-InitialSchema.ts"],
  },
  {
    label: "Controle de exceção",
    paths: [
      "backend/src/exceptions/application.exception.ts",
      "backend/src/exceptions/problem-types.ts",
      "backend/src/exceptions/resource-not-found.exception.ts",
      "backend/src/exceptions/resource-already-exists.exception.ts",
      "backend/src/middlewares/global-exception.handler.ts",
      "backend/src/middlewares/validate-request.middleware.ts",
      "backend/src/repositories/typeorm/constraint-violation.ts",
    ],
  },
]

/**
 * Embute o codigo-fonte da API no bundle, em tempo de build.
 *
 * Assim a interface mostra os arquivos sem precisar de um endpoint que leia
 * disco — a API avaliada continua sendo so a API do dominio, e a pagina
 * funciona sem rede.
 */
export function sourceCatalogPlugin(projectRoot: string): Plugin {
  return {
    name: "source-catalog",

    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? RESOLVED_ID : undefined
    },

    load(id) {
      if (id !== RESOLVED_ID) {
        return undefined
      }

      const catalog = CATALOG_GROUPS.map((group) => ({
        label: group.label,
        files: group.paths.flatMap((path) => {
          const absolutePath = join(projectRoot, path)
          if (!existsSync(absolutePath)) {
            // Um arquivo renomeado nao pode derrubar o build inteiro.
            this.warn(`arquivo do catalogo nao encontrado: ${path}`)
            return []
          }
          return [{ path, content: readFileSync(absolutePath, "utf8") }]
        }),
      }))

      return `export const sourceCatalog = ${JSON.stringify(catalog)}`
    },
  }
}
