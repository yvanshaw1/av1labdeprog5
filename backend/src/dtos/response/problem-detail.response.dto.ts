import type { ValidationIssue } from "../../exceptions/validation-issue.js"

/**
 * Corpo padrao de toda resposta de erro da API, no formato RFC 9457
 * (Problem Details for HTTP APIs), servido como `application/problem+json`.
 */
export interface ProblemDetailResponseDto {
  /** Identificador do tipo de problema — estavel, serve de chave para o cliente tratar o erro. */
  readonly type: string
  /** Resumo legivel do tipo de problema. Nao varia entre ocorrencias. */
  readonly title: string
  readonly status: number
  /** Descricao desta ocorrencia especifica. */
  readonly detail: string
  /** Caminho da requisicao que gerou o erro. */
  readonly instance: string
  /** Presente apenas em falhas de validacao. */
  readonly errors?: readonly ValidationIssue[]
}
