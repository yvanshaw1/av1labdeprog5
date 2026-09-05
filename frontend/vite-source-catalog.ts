import { readFileSync } from "node:fs"
import { join } from "node:path"
import type { Plugin } from "vite"

const VIRTUAL_MODULE_ID = "virtual:source-catalog"
const RESOLVED_ID = `\0${VIRTUAL_MODULE_ID}`

/** Os arquivos que atendem apenas um recurso, nomeados a partir dele. */
function filesOfResource(singular: string, pascal: string): SourceGroupSpec[] {
  return [
    {
      label: "Backend deste recurso",
      paths: [
        `backend/src/models/${singular}.entity.ts`,
        `backend/src/dtos/request/create-${singular}.request.dto.ts`,
        `backend/src/dtos/request/update-${singular}.request.dto.ts`,
        `backend/src/dtos/response/${singular}.response.dto.ts`,
        `backend/src/mappers/${singular}.mapper.ts`,
        `backend/src/services/${singular}.service.ts`,
        `backend/src/repositories/${singular}.repository.ts`,
        `backend/src/repositories/typeorm/typeorm-${singular}.repository.ts`,
      ],
    },
    {
      label: "Frontend deste recurso",
      paths: [
        `frontend/src/api/${singular}-api.ts`,
        `frontend/src/components/${pascal}Form.tsx`,
        `frontend/src/pages/${pascal}Page.tsx`,
      ],
    },
  ]
}

/** O que os quatro recursos usam em comum — descrito uma vez, no codigo e aqui. */
const SHARED_GROUPS: SourceGroupSpec[] = [
  {
    label: "Compartilhado — backend",
    paths: [
      "backend/src/application.ts",
      "backend/src/container.ts",
      "backend/src/routes/crud-routes.ts",
      "backend/src/controllers/crud.controller.ts",
      "backend/src/services/crud.service.ts",
      "backend/src/repositories/crud.repository.ts",
      "backend/src/repositories/typeorm/typeorm-crud.repository.ts",
      "backend/src/middlewares/validate-request.middleware.ts",
      "backend/src/middlewares/global-exception.handler.ts",
      "backend/src/exceptions/application.exception.ts",
    ],
  },
  {
    label: "Compartilhado — frontend",
    paths: [
      "frontend/src/api/http.ts",
      "frontend/src/api/resource-api.ts",
      "frontend/src/hooks/useResourceCrud.ts",
      "frontend/src/components/ResourceTable.tsx",
    ],
  },
]

const RESOURCE_FILES: Record<string, SourceGroupSpec[]> = {
  clients: filesOfResource("client", "Client"),
  vehicles: filesOfResource("vehicle", "Vehicle"),
  services: filesOfResource("service", "Service"),
  appointments: [
    ...filesOfResource("appointment", "Appointment"),
    {
      label: "Junção N:N do agendamento",
      paths: ["backend/src/models/appointment-item.entity.ts"],
    },
  ],
}

interface SourceGroupSpec {
  label: string
  paths: string[]
}

/**
 * Embute o codigo-fonte do projeto no bundle, em tempo de build.
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
            files: group.paths.map((path) => ({
              path,
              content: readFileSync(join(projectRoot, path), "utf8"),
            })),
          })),
        ]),
      )

      return `export const sourceCatalog = ${JSON.stringify(catalog)}`
    },
  }
}
