import { useEffect, useState } from "react"

interface ResourceList<Entity> {
  items: Entity[]
  errorMessage: string | null
}

/**
 * Leitura simples de uma lista, para telas que precisam de outro recurso além do
 * que estão editando — a de veículos precisa dos clientes para montar o select.
 */
export function useResourceList<Entity>(list: () => Promise<Entity[]>): ResourceList<Entity> {
  const [items, setItems] = useState<Entity[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void list()
      .then(setItems)
      .catch((error: unknown) => {
        setErrorMessage(error instanceof Error ? error.message : "Não foi possível concluir a ação. Tente novamente.")
      })
  }, [list])

  return { items, errorMessage }
}
