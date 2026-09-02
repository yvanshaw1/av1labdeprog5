import type { ValueTransformer } from "typeorm"

/**
 * O driver do PostgreSQL entrega colunas `numeric`/`decimal` como string para
 * nao perder precisao. Sem este transformer, `price` chegaria como "150.00" e
 * qualquer soma viraria concatenacao de texto.
 */
export const numericColumnTransformer: ValueTransformer = {
  to: (value: number | null): number | null => value,
  from: (value: string | null): number | null => (value === null ? null : Number(value)),
}
