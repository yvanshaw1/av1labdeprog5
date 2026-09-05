declare module "virtual:source-catalog" {
  export interface SourceFile {
    readonly path: string
    readonly content: string
  }

  export interface SourceGroup {
    readonly label: string
    readonly files: readonly SourceFile[]
  }

  /** Os arquivos da API, agrupados pelos critérios do enunciado. */
  export const sourceCatalog: readonly SourceGroup[]
}
