import "reflect-metadata"
import { join } from "node:path"
import { DataSource } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import { Appointment } from "../models/appointment.entity.js"
import { AppointmentItem } from "../models/appointment-item.entity.js"
import { Client } from "../models/client.entity.js"
import { Service } from "../models/service.entity.js"
import { Vehicle } from "../models/vehicle.entity.js"
import { environment } from "./environment.js"

export const appDataSource = new DataSource({
  type: "postgres",
  host: environment.DATABASE_HOST,
  port: environment.DATABASE_PORT,
  username: environment.DATABASE_USERNAME,
  password: environment.DATABASE_PASSWORD,
  database: environment.DATABASE_NAME,
  // Lista explicita em vez de glob: com ESM o glob depende do formato dos
  // caminhos e falha silenciosamente, deixando entidades fora do schema.
  entities: [Client, Vehicle, Service, Appointment, AppointmentItem],
  // `import.meta.dirname` resolve tanto em src/ (via tsx) quanto em dist/.
  migrations: [join(import.meta.dirname, "../migrations/*.{ts,js}")],
  namingStrategy: new SnakeNamingStrategy(),
  // O schema so muda por migration versionada, nunca por sincronizacao automatica.
  synchronize: false,
  logging: ["error", "warn"],
})
