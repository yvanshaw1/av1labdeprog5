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
function filesOfResource(singular: string, extraModels: string[] = []): SourceGroupSpec[] {
  return [
    {
      label: "Model — entidade e regras de negócio",
      paths: [
        `backend/src/models/${singular}.entity.ts`,
        ...extraModels,
        `backend/src/services/${singular}.service.ts`,
      ],
    },
    {
      label: "DTO e Mapper",
      paths: [
        `backend/src/dtos/request/create-${singular}.request.dto.ts`,
        `backend/src/dtos/request/update-${singular}.request.dto.ts`,
        `backend/src/dtos/response/${singular}.response.dto.ts`,
        `backend/src/mappers/${singular}.mapper.ts`,
      ],
    },
    {
      label: "Repository — contrato e implementação",
      paths: [
        `backend/src/repositories/${singular}.repository.ts`,
        `backend/src/repositories/typeorm/typeorm-${singular}.repository.ts`,
      ],
    },
  ]
}

/** O que os quatro recursos compartilham, tambem agrupado por criterio. */
const SHARED_GROUPS: SourceGroupSpec[] = [
  {
    label: "MVC — Controller e verbos HTTP",
    paths: [
      "backend/src/controllers/crud.controller.ts",
      "backend/src/routes/crud-routes.ts",
      "backend/src/routes/resource-identifier.schema.ts",
      "backend/src/application.ts",
      "backend/src/container.ts",
    ],
  },
  {
    label: "Base comum aos quatro recursos",
    paths: [
      "backend/src/services/crud.service.ts",
      "backend/src/repositories/crud.repository.ts",
      "backend/src/repositories/typeorm/typeorm-crud.repository.ts",
    ],
  },
  {
    label: "ORM — conexão, migration e mapeamento",
    paths: [
      "backend/src/config/data-source.ts",
      "backend/src/migrations/1788279840938-InitialSchema.ts",
      "backend/src/models/numeric-column.transformer.ts",
    ],
  },
  {
    label: "Controle de exceção",
    paths: [
      "backend/src/exceptions/application.exception.ts",
      "backend/src/exceptions/problem-types.ts",
      "backend/src/exceptions/resource-not-found.exception.ts",
      "backend/src/exceptions/business-rule.exception.ts",
      "backend/src/middlewares/global-exception.handler.ts",
      "backend/src/middlewares/validate-request.middleware.ts",
      "backend/src/repositories/typeorm/constraint-violation.ts",
    ],
  },
]

const RESOURCE_FILES: Record<string, SourceGroupSpec[]> = {
  clients: filesOfResource("client"),
  vehicles: filesOfResource("vehicle"),
  services: filesOfResource("service"),
  appointments: filesOfResource("appointment", ["backend/src/models/appointment-item.entity.ts"]),
}

/**
 * Embute o codigo-fonte da API no bundle, em tempo de build.
 *
 * Assim a interface mostra os arquivos de cada recurso sem precisar de um
 * endpoint que leia disco — a API avaliada continua sendo so a API do dominio,
 * e a pagina funciona sem rede.
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

      const catalog = Object.fromEntries(
        Object.entries(RESOURCE_FILES).map(([resource, groups]) => [
          resource,
          [...groups, ...SHARED_GROUPS].map((group) => ({
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
          })),
        ]),
      )

      return `export const sourceCatalog = ${JSON.stringify(catalog)}`
    },
  }
}
