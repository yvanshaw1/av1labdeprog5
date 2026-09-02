import type { DataSource } from "typeorm"
import type { ApplicationRepositories } from "./application.js"
import { TypeOrmAppointmentRepository } from "./repositories/typeorm/typeorm-appointment.repository.js"
import { TypeOrmClientRepository } from "./repositories/typeorm/typeorm-client.repository.js"
import { TypeOrmServiceRepository } from "./repositories/typeorm/typeorm-service.repository.js"
import { TypeOrmVehicleRepository } from "./repositories/typeorm/typeorm-vehicle.repository.js"

/**
 * Raiz de composicao da persistencia: e' o unico ponto do sistema que escolhe
 * qual implementacao de repositorio a aplicacao vai usar.
 */
export function buildTypeOrmRepositories(dataSource: DataSource): ApplicationRepositories {
  return {
    clientRepository: new TypeOrmClientRepository(dataSource),
    vehicleRepository: new TypeOrmVehicleRepository(dataSource),
    serviceRepository: new TypeOrmServiceRepository(dataSource),
    appointmentRepository: new TypeOrmAppointmentRepository(dataSource),
  }
}
