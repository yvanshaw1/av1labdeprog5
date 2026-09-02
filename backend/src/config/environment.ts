import { config as loadDotEnvironmentFile } from "dotenv"
import { parseEnvironment } from "./environment.schema.js"

// Precisa acontecer antes de ler `process.env`. Um NODE_ENV=test carrega o
// `.env.test`, para que apontar a aplicacao ao banco de teste nao dependa de
// editar o arquivo do banco de desenvolvimento.
loadDotEnvironmentFile({ path: process.env["NODE_ENV"] === "test" ? ".env.test" : ".env", quiet: true })

export const environment = parseEnvironment(process.env)
