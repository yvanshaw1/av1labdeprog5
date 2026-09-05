import { z } from "zod"

/**
 * Os padroes valem para uma instalacao local recem-feita do PostgreSQL, para
 * que clonar o repositorio e rodar funcione sem criar arquivo nenhum. Quem tiver
 * outro host, usuario ou senha sobrescreve pelo `.env` — que fica fora do
 * versionamento justamente por conter credencial.
 */
const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_HOST: z.string().min(1).default("localhost"),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USERNAME: z.string().min(1).default("postgres"),
  DATABASE_PASSWORD: z.string().default(""),
  DATABASE_NAME: z.string().min(1).default("av1labdeprog5"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

export type Environment = z.infer<typeof environmentSchema>

/**
 * Valida e converte as variaveis de ambiente.
 *
 * Separado de `environment.ts` de proposito: aqui nao ha leitura de arquivo nem
 * acesso a `process.env`, entao a regra pode ser testada sem depender de um
 * `.env` existir na maquina.
 */
export function parseEnvironment(source: Record<string, string | undefined>): Environment {
  const parseResult = environmentSchema.safeParse(source)

  if (!parseResult.success) {
    const invalidVariables = parseResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n  ")
    throw new Error(`Variaveis de ambiente invalidas:\n  ${invalidVariables}`)
  }

  return parseResult.data
}
