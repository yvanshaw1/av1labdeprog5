import express, { type Express, type Router } from "express"
import { CrudController } from "./controllers/crud.controller.js"
import { createAppointmentRequestSchema } from "./dtos/request/create-appointment.request.dto.js"
import { createClientRequestSchema } from "./dtos/request/create-client.request.dto.js"
import { createServiceRequestSchema } from "./dtos/request/create-service.request.dto.js"
import { createVehicleRequestSchema } from "./dtos/request/create-vehicle.request.dto.js"
import { updateAppointmentRequestSchema } from "./dtos/request/update-appointment.request.dto.js"
import { updateClientRequestSchema } from "./dtos/request/update-client.request.dto.js"
import { updateServiceRequestSchema } from "./dtos/request/update-service.request.dto.js"
import { updateVehicleRequestSchema } from "./dtos/request/update-vehicle.request.dto.js"
import { appointmentMapper } from "./mappers/appointment.mapper.js"
import { clientMapper } from "./mappers/client.mapper.js"
import { serviceMapper } from "./mappers/service.mapper.js"
import { vehicleMapper } from "./mappers/vehicle.mapper.js"
import { globalExceptionHandler } from "./middlewares/global-exception.handler.js"
import { jsonBodyFailureTranslator, jsonBodyParser } from "./middlewares/json-body.middleware.js"
import { routeNotFoundMiddleware } from "./middlewares/route-not-found.middleware.js"
import { buildWebAppRoutes } from "./middlewares/web-app.middleware.js"
import type { AppointmentRepository } from "./repositories/appointment.repository.js"
import type { ClientRepository } from "./repositories/client.repository.js"
import type { ServiceRepository } from "./repositories/service.repository.js"
import type { VehicleRepository } from "./repositories/vehicle.repository.js"
import { buildCrudRoutes } from "./routes/crud-routes.js"
import { buildHealthRoutes } from "./routes/health-routes.js"
import { AppointmentService } from "./services/appointment.service.js"
import { ClientService } from "./services/client.service.js"
import { ServiceService } from "./services/service.service.js"
import { VehicleService } from "./services/vehicle.service.js"

/**
 * Repositorios que a aplicacao precisa para funcionar.
 *
 * Recebe-los de fora e' o que mantem a montagem independente da persistencia:
 * quem escolhe a implementacao e' o `container.ts`.
 */
export interface ApplicationRepositories {
  readonly clientRepository: ClientRepository
  readonly vehicleRepository: VehicleRepository
  readonly serviceRepository: ServiceRepository
  readonly appointmentRepository: AppointmentRepository
}

interface MountedResource {
  readonly path: string
  readonly router: Router
}

function clientResource(repositories: ApplicationRepositories): MountedResource {
  const clientService = new ClientService(repositories.clientRepository)
  return {
    path: "/api/clients",
    router: buildCrudRoutes(new CrudController(clientService, clientMapper.fromEntityToResponseDto), {
      createRequestSchema: createClientRequestSchema,
      updateRequestSchema: updateClientRequestSchema,
    }),
  }
}

function vehicleResource(repositories: ApplicationRepositories): MountedResource {
  const vehicleService = new VehicleService(repositories.vehicleRepository, repositories.clientRepository)
  return {
    path: "/api/vehicles",
    router: buildCrudRoutes(new CrudController(vehicleService, vehicleMapper.fromEntityToResponseDto), {
      createRequestSchema: createVehicleRequestSchema,
      updateRequestSchema: updateVehicleRequestSchema,
    }),
  }
}

function serviceResource(repositories: ApplicationRepositories): MountedResource {
  const serviceService = new ServiceService(repositories.serviceRepository)
  return {
    path: "/api/services",
    router: buildCrudRoutes(new CrudController(serviceService, serviceMapper.fromEntityToResponseDto), {
      createRequestSchema: createServiceRequestSchema,
      updateRequestSchema: updateServiceRequestSchema,
    }),
  }
}

function appointmentResource(repositories: ApplicationRepositories): MountedResource {
  const appointmentService = new AppointmentService(repositories)
  return {
    path: "/api/appointments",
    router: buildCrudRoutes(new CrudController(appointmentService, appointmentMapper.fromEntityToResponseDto), {
      createRequestSchema: createAppointmentRequestSchema,
      updateRequestSchema: updateAppointmentRequestSchema,
    }),
  }
}

function buildResources(repositories: ApplicationRepositories): MountedResource[] {
  return [
    clientResource(repositories),
    vehicleResource(repositories),
    serviceResource(repositories),
    appointmentResource(repositories),
  ]
}

/**
 * Composicao das camadas e montagem da aplicacao Express.
 *
 * Nao abre porta de proposito: quem escuta e' o `server.ts`.
 *
 * @param webAppDirectory Pasta da interface compilada. Informada, a aplicacao
 *                        serve API e site na mesma porta; omitida, so a API.
 */
export function createApplication(repositories: ApplicationRepositories, webAppDirectory?: string): Express {
  const application = express()
  application.use(jsonBodyParser)
  // Logo depois do parser, para traduzir as falhas dele antes de qualquer rota.
  application.use(jsonBodyFailureTranslator)

  application.use("/health", buildHealthRoutes())
  for (const resource of buildResources(repositories)) {
    application.use(resource.path, resource.router)
  }

  // Depois da API: a interface so responde nos caminhos que a API nao atende.
  if (webAppDirectory !== undefined) {
    application.use(buildWebAppRoutes(webAppDirectory))
  }

  // A ordem importa: rota nao encontrada primeiro, handler de excecao por ultimo.
  application.use(routeNotFoundMiddleware)
  application.use(globalExceptionHandler)

  return application
}
