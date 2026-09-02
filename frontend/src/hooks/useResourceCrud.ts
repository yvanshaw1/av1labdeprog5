import { useCallback, useEffect, useState } from "react"
import type { ResourceApi } from "../api/resource-api.ts"
import type { AsyncState } from "../lib/async-state.ts"

export interface ResourceCrud<Entity, Input> {
  listState: AsyncState<Entity[]>
  editingItem: Entity | null
  errorMessage: string | null
  /** Muda a cada gravação bem-sucedida; usar como `key` do formulário para zerá-lo. */
  formKey: string
  startEditing(item: Entity): void
  cancelEditing(): void
  submit(input: Input): Promise<void>
  remove(item: Entity): Promise<void>
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Não foi possível concluir a ação. Tente novamente."
}

/**
 * Máquina de estado de uma tela de CRUD: lista, item em edição, mensagem de erro
 * e recarga após gravar.
 *
 * As quatro telas se comportam igual — o que muda são os campos do formulário e
 * as colunas da tabela, que ficam em cada página.
 */
export function useResourceCrud<Entity extends { id: string }, Input>(
  api: ResourceApi<Entity, Input>,
): ResourceCrud<Entity, Input> {
  const [listState, setListState] = useState<AsyncState<Entity[]>>({ status: "loading" })
  const [editingItem, setEditingItem] = useState<Entity | null>(null)
  const [writeErrorMessage, setWriteErrorMessage] = useState<string | null>(null)
  // Avança só quando a gravação dá certo, forçando o formulário a remontar vazio.
  // Se a API recusar, o contador não avança e o que foi digitado continua lá.
  const [savedFormGeneration, setSavedFormGeneration] = useState(0)

  const reload = useCallback(async (): Promise<void> => {
    try {
      setListState({ status: "success", value: await api.list() })
    } catch (error) {
      setListState({ status: "error", message: toErrorMessage(error) })
    }
  }, [api])

  useEffect(() => {
    // A regra mira em setState síncrono no efeito, que causa render em cascata.
    // Aqui o estado só muda quando a resposta da API chega — é a carga inicial
    // da lista, sem biblioteca de data fetching.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload()
  }, [reload])

  async function submit(input: Input): Promise<void> {
    setWriteErrorMessage(null)
    try {
      if (editingItem === null) {
        await api.create(input)
      } else {
        await api.update(editingItem.id, input)
      }
      setEditingItem(null)
      setSavedFormGeneration((generation) => generation + 1)
      await reload()
    } catch (error) {
      setWriteErrorMessage(toErrorMessage(error))
    }
  }

  async function remove(item: Entity): Promise<void> {
    setWriteErrorMessage(null)
    try {
      await api.remove(item.id)
      if (editingItem?.id === item.id) {
        setEditingItem(null)
      }
      await reload()
    } catch (error) {
      setWriteErrorMessage(toErrorMessage(error))
    }
  }

  return {
    listState,
    editingItem,
    // Derivado, nunca sincronizado: a falha de leitura ja mora no `listState`.
    errorMessage: writeErrorMessage ?? (listState.status === "error" ? listState.message : null),
    formKey: editingItem?.id ?? `new-${savedFormGeneration}`,
    startEditing: setEditingItem,
    cancelEditing: () => setEditingItem(null),
    submit,
    remove,
  }
}
