declare module "virtual:source-catalog" {
  export interface SourceFile {
    readonly path: string
    readonly content: string
  }

  export interface SourceGroup {
    readonly label: string
    readonly files: readonly SourceFile[]
  }

  /** Chaveado pelo recurso: "clients", "vehicles", "services", "appointments". */
  export const sourceCatalog: Record<string, readonly SourceGroup[]>
}
