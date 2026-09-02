/** Um campo reprovado na validacao do corpo ou dos parametros da requisicao. */
export interface ValidationIssue {
  readonly field: string
  readonly message: string
}
