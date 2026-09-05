import "reflect-metadata"
import { join } from "node:path"
import { DataSource } from "typeorm"
import { SnakeNamingStrategy } from "typeorm-naming-strategies"
import { Client } from "../models/client.entity.js"
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
  entities: [Client],
  // `import.meta.dirname` resolve tanto em src/ (via tsx) quanto em dist/.
  migrations: [join(import.meta.dirname, "../migrations/*.{ts,js}")],
  namingStrategy: new SnakeNamingStrategy(),
  // O schema so muda por migration versionada, nunca por sincronizacao automatica.
  synchronize: false,
  logging: ["error", "warn"],
})
