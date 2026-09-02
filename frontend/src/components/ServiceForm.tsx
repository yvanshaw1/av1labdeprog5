import { useState, type FormEvent } from "react"
import type { Service, ServiceInput } from "../api/service-api.ts"

interface ServiceFormProps {
  editingService: Service | null
  onSubmit: (input: ServiceInput) => Promise<void>
  onCancel: () => void
}

interface ServiceFormFields {
  name: string
  description: string
  price: string
  durationInMinutes: string
}

const EMPTY_FIELDS: ServiceFormFields = { name: "", description: "", price: "", durationInMinutes: "" }

export function ServiceForm({ editingService, onSubmit, onCancel }: ServiceFormProps) {
  const [fields, setFields] = useState<ServiceFormFields>(
    editingService === null
      ? EMPTY_FIELDS
      : {
          name: editingService.name,
          description: editingService.description ?? "",
          price: String(editingService.price),
          durationInMinutes: String(editingService.durationInMinutes),
        },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = editingService !== null

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: fields.name,
        // A API distingue descrição ausente (null) de texto vazio.
        description: fields.description.trim() === "" ? null : fields.description.trim(),
        price: Number(fields.price),
        durationInMinutes: Number(fields.durationInMinutes),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Editar serviço" : "Novo serviço"}</h2>

      <label htmlFor="serviceName">Nome</label>
      <input
        id="serviceName"
        value={fields.name}
        onChange={(event) => setFields({ ...fields, name: event.target.value })}
      />

      <label htmlFor="serviceDescription">Descrição</label>
      <textarea
        id="serviceDescription"
        rows={2}
        value={fields.description}
        onChange={(event) => setFields({ ...fields, description: event.target.value })}
      />

      <label htmlFor="servicePrice">Preço (R$)</label>
      <input
        id="servicePrice"
        type="number"
        step="0.01"
        min="0"
        value={fields.price}
        onChange={(event) => setFields({ ...fields, price: event.target.value })}
      />

      <label htmlFor="serviceDuration">Duração (minutos)</label>
      <input
        id="serviceDuration"
        type="number"
        min="1"
        value={fields.durationInMinutes}
        onChange={(event) => setFields({ ...fields, durationInMinutes: event.target.value })}
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
