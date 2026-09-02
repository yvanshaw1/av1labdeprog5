import { useState, type FormEvent } from "react"
import type { Client, ClientInput } from "../api/client-api.ts"

interface ClientFormProps {
  /** Quando presente, o formulário está editando este cliente. */
  editingClient: Client | null
  onSubmit: (input: ClientInput) => Promise<void>
  onCancel: () => void
}

const EMPTY_INPUT: ClientInput = { fullName: "", email: "", phoneNumber: "" }

export function ClientForm({ editingClient, onSubmit, onCancel }: ClientFormProps) {
  const [input, setInput] = useState<ClientInput>(
    editingClient === null
      ? EMPTY_INPUT
      : {
          fullName: editingClient.fullName,
          email: editingClient.email,
          phoneNumber: editingClient.phoneNumber,
        },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = editingClient !== null

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit(input)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Editar cliente" : "Novo cliente"}</h2>

      <label htmlFor="fullName">Nome completo</label>
      <input
        id="fullName"
        value={input.fullName}
        onChange={(event) => setInput({ ...input, fullName: event.target.value })}
      />

      <label htmlFor="email">E-mail</label>
      <input
        id="email"
        value={input.email}
        onChange={(event) => setInput({ ...input, email: event.target.value })}
      />

      <label htmlFor="phoneNumber">Telefone</label>
      <input
        id="phoneNumber"
        value={input.phoneNumber}
        onChange={(event) => setInput({ ...input, phoneNumber: event.target.value })}
      />

      <div className="resource-form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isEditing ? "Salvar" : "Cadastrar"}
        </button>
        {isEditing ? (
          <button type="button" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}
