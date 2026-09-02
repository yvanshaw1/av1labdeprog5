import { useState, type FormEvent } from "react"
import type { Appointment, CreateAppointmentInput, UpdateAppointmentInput } from "../api/appointment-api.ts"
import type { Client } from "../api/client-api.ts"
import type { Service } from "../api/service-api.ts"
import type { Vehicle } from "../api/vehicle-api.ts"
import { toIsoTimestamp, toLocalDateTimeValue } from "../lib/formatting.ts"

interface AppointmentFormProps {
  editingAppointment: Appointment | null
  clients: Client[]
  vehicles: Vehicle[]
  services: Service[]
  onSubmit: (input: CreateAppointmentInput | UpdateAppointmentInput) => Promise<void>
  onCancel: () => void
}

interface AppointmentFormFields {
  clientId: string
  vehicleId: string
  scheduledFor: string
  serviceIds: string[]
}

export function AppointmentForm({
  editingAppointment,
  clients,
  vehicles,
  services,
  onSubmit,
  onCancel,
}: AppointmentFormProps) {
  const [fields, setFields] = useState<AppointmentFormFields>(
    editingAppointment === null
      ? { clientId: "", vehicleId: "", scheduledFor: "", serviceIds: [] }
      : {
          clientId: editingAppointment.clientId,
          vehicleId: editingAppointment.vehicleId,
          scheduledFor: toLocalDateTimeValue(editingAppointment.scheduledFor),
          serviceIds: editingAppointment.items.map((item) => item.serviceId),
        },
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = editingAppointment !== null
  // Agendar exige que o veículo seja do cliente — oferecer os outros só levaria
  // o usuário a um 422 evitável.
  const vehiclesOfSelectedClient = vehicles.filter((vehicle) => vehicle.clientId === fields.clientId)
  const canSubmit =
    fields.vehicleId !== "" && fields.scheduledFor !== "" && fields.serviceIds.length > 0 && !isSubmitting

  function selectClient(clientId: string): void {
    // O veículo escolhido pertencia ao cliente anterior: sai junto.
    setFields({ ...fields, clientId, vehicleId: "" })
  }

  function toggleService(serviceId: string): void {
    setFields({
      ...fields,
      serviceIds: fields.serviceIds.includes(serviceId)
        ? fields.serviceIds.filter((chosenId) => chosenId !== serviceId)
        : [...fields.serviceIds, serviceId],
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const commonFields: UpdateAppointmentInput = {
        vehicleId: fields.vehicleId,
        scheduledFor: toIsoTimestamp(fields.scheduledFor),
        serviceIds: fields.serviceIds,
      }
      // Sem total no corpo: quem calcula é o servidor, a partir do catálogo.
      await onSubmit(isEditing ? commonFields : { ...commonFields, clientId: fields.clientId })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="resource-form" onSubmit={handleSubmit}>
      <h2>{isEditing ? "Editar agendamento" : "Novo agendamento"}</h2>

      {isEditing ? null : (
        <>
          <label htmlFor="appointmentClient">Cliente</label>
          <select
            id="appointmentClient"
            value={fields.clientId}
            onChange={(event) => selectClient(event.target.value)}
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

      <label htmlFor="appointmentVehicle">Veículo</label>
      <select
        id="appointmentVehicle"
        value={fields.vehicleId}
        onChange={(event) => setFields({ ...fields, vehicleId: event.target.value })}
      >
        <option value="">Selecione o veículo</option>
        {vehiclesOfSelectedClient.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {vehicle.licensePlate}
          </option>
        ))}
      </select>

      <label htmlFor="appointmentScheduledFor">Data e hora</label>
      <input
        id="appointmentScheduledFor"
        type="datetime-local"
        value={fields.scheduledFor}
        onChange={(event) => setFields({ ...fields, scheduledFor: event.target.value })}
      />

      <fieldset className="service-picker">
        <legend>Serviços</legend>
        {services.map((service) => (
          <label key={service.id} htmlFor={`service-${service.id}`}>
            <input
              id={`service-${service.id}`}
              type="checkbox"
              checked={fields.serviceIds.includes(service.id)}
              onChange={() => toggleService(service.id)}
            />
            {service.name}
          </label>
        ))}
      </fieldset>

      <div className="resource-form-actions">
        <button type="submit" disabled={!canSubmit}>
          {isEditing ? "Salvar" : "Agendar"}
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
