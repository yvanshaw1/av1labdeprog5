import type { ReactNode } from "react"
import type { AsyncState } from "../lib/async-state.ts"

export interface ResourceTableColumn<Entity> {
  header: string
  render(entity: Entity): ReactNode
}

interface ResourceTableProps<Entity> {
  columns: ResourceTableColumn<Entity>[]
  state: AsyncState<Entity[]>
  /** Vai no aria-label dos botões, para distinguir as ações de cada linha. */
  getRowLabel(entity: Entity): string
  emptyMessage: string
  onEdit(entity: Entity): void
  onDelete(entity: Entity): void
}

export function ResourceTable<Entity extends { id: string }>({
  columns,
  state,
  getRowLabel,
  emptyMessage,
  onEdit,
  onDelete,
}: ResourceTableProps<Entity>) {
  // Carregando e vazio sao estados diferentes: antes desta distincao, a tela
  // afirmava "nenhum cadastrado" enquanto a resposta ainda estava a caminho.
  if (state.status === "loading") {
    return (
      <p className="list-status" role="status">
        Carregando…
      </p>
    )
  }

  // O detalhe do erro aparece no ErrorBanner; aqui basta nao fingir lista vazia.
  if (state.status === "error") {
    return (
      <p className="list-status" role="status">
        Não foi possível carregar a lista.
      </p>
    )
  }

  if (state.value.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  return (
    <table className="resource-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.header} scope="col">
              {column.header}
            </th>
          ))}
          <th scope="col">Ações</th>
        </tr>
      </thead>
      <tbody>
        {state.value.map((row) => (
          <tr key={row.id}>
            {columns.map((column) => (
              <td key={column.header}>{column.render(row)}</td>
            ))}
            <td className="resource-table-actions">
              <button type="button" aria-label={`Editar ${getRowLabel(row)}`} onClick={() => onEdit(row)}>
                Editar
              </button>
              <button type="button" aria-label={`Excluir ${getRowLabel(row)}`} onClick={() => onDelete(row)}>
                Excluir
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
