import { z } from "zod"

const environmentSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_HOST: z.string().min(1),
  DATABASE_PORT: z.coerce.number().int().positive().default(5432),
  DATABASE_USERNAME: z.string().min(1),
  DATABASE_PASSWORD: z.string(),
  DATABASE_NAME: z.string().min(1),
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
    throw new Error(`Variaveis de ambiente invalidas ou ausentes:\n  ${invalidVariables}`)
  }

  return parseResult.data
}
