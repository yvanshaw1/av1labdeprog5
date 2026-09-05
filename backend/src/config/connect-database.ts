import { appDataSource } from "./data-source.js"
import { environment } from "./environment.js"

/**
 * Abre a conexao e, se falhar, explica o que fazer.
 *
 * Sem isto o erro que aparece e' o do driver — util para quem escreveu o
 * codigo, inutil para quem so clonou o repositorio e quer rodar.
 */
export async function connectDatabase(): Promise<void> {
  try {
    await appDataSource.initialize()
  } catch (error) {
    const target = `${environment.DATABASE_HOST}:${environment.DATABASE_PORT}/${environment.DATABASE_NAME}`

    console.error(
      [
        ``,
        `Nao foi possivel conectar ao PostgreSQL em ${target} com o usuario "${environment.DATABASE_USERNAME}".`,
        ``,
        `1. O PostgreSQL esta rodando?`,
        `2. O banco existe?`,
        `     psql -U postgres -c "CREATE DATABASE ${environment.DATABASE_NAME};"`,
        `3. Usuario ou senha diferentes? Crie o arquivo backend/.env com:`,
        `     DATABASE_HOST=localhost`,
        `     DATABASE_PORT=5432`,
        `     DATABASE_USERNAME=postgres`,
        `     DATABASE_PASSWORD=sua_senha`,
        `     DATABASE_NAME=${environment.DATABASE_NAME}`,
        ``,
        `Detalhe tecnico: ${error instanceof Error ? error.message : String(error)}`,
        ``,
      ].join("\n"),
    )

    throw error
  }
}
