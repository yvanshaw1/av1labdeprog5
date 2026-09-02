import { useState, type FormEvent } from "react"
import type { Client } from "../api/client-api.ts"
import type { CreateVehicleInput, UpdateVehicleInput, Vehicle } from "../api/vehicle-api.ts"

interface VehicleFormProps {
  editingVehicle: Vehicle | null
  clients: Client[]
  onSubmit: (input: CreateVehicleInput | UpdateVehicleInput) => Promise<void>
  onCancel: () => void
}

interface VehicleFormFields {
  clientId: string
  licensePlate: string
  make: string
  model: string
  manufactureYear: string
  color: string
}

const EMPTY_FIELDS: VehicleFormFields = {
  clientId: "",
  licensePlate: "",
  make: "",
  model: "",
  manufactureYear: "",
  color: "",
}

export function VehicleForm({ editingVehicle, clients, onSubmit, onCancel }: VehicleFormProps) {
  const [fields, setFields] = useState<VehicleFormFields>(
    editingVehicle === null
      ? EMPTY_FIELDS
      : {
          clientId: editingVehicle.clientId,
          licensePlate: editingVehicle.licensePlate,
          make: editingVehicle.make,
          model: editingVehicle.model,
          manufactureYear: String(editingVehicle.manufactureYear),
          color: editingVehicle.color,
        },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = editingVehicle !== null

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const commonFields: UpdateVehicleInput = {
        licensePlate: fields.licensePlate,
        make: fields.make,
        model: fields.model,
        manufactureYear: Number(fields.manufactureYear),
        color: fields.color,
      }
      // O dono só vai no cadastro: a API recusa `clientId` num PUT.
      await onSubmit(isEditing ? commonFields : { ...commonFields, clientId: fields.clientId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Editar veículo" : "Novo veículo"}</h2>

      {isEditing ? null : (
        <>
          <label htmlFor="vehicleClient">Cliente</label>
          <select
            id="vehicleClient"
            value={fields.clientId}
            onChange={(event) => setFields({ ...fields, clientId: event.target.value })}
          >
            <option value="">Selecione o cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.fullName}
              </option>
            ))}
          </select>
        </>
      )}

      <label htmlFor="vehicleLicensePlate">Placa</label>
      <input
        id="vehicleLicensePlate"
        placeholder="ABC1D23"
        value={fields.licensePlate}
        onChange={(event) => setFields({ ...fields, licensePlate: event.target.value })}
      />

      <label htmlFor="vehicleMake">Marca</label>
      <input
        id="vehicleMake"
        value={fields.make}
        onChange={(event) => setFields({ ...fields, make: event.target.value })}
      />

      <label htmlFor="vehicleModel">Modelo</label>
      <input
        id="vehicleModel"
        value={fields.model}
        onChange={(event) => setFields({ ...fields, model: event.target.value })}
      />

      <label htmlFor="vehicleManufactureYear">Ano</label>
      <input
        id="vehicleManufactureYear"
        type="number"
        value={fields.manufactureYear}
        onChange={(event) => setFields({ ...fields, manufactureYear: event.target.value })}
      />

      <label htmlFor="vehicleColor">Cor</label>
      <input
        id="vehicleColor"
        value={fields.color}
        onChange={(event) => setFields({ ...fields, color: event.target.value })}
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
