import { appointmentApi, type Appointment } from "../api/appointment-api.ts"
import { clientApi } from "../api/client-api.ts"
import { serviceApi } from "../api/service-api.ts"
import { vehicleApi } from "../api/vehicle-api.ts"
import { ApiEndpointLink } from "../components/ApiEndpointLink.tsx"
import { AppointmentForm } from "../components/AppointmentForm.tsx"
import { ErrorBanner } from "../components/ErrorBanner.tsx"
import { ResourceTable } from "../components/ResourceTable.tsx"
import { useResourceCrud } from "../hooks/useResourceCrud.ts"
import { useResourceList } from "../hooks/useResourceList.ts"
import { formatCurrency, formatDateTime, formatDuration } from "../lib/formatting.ts"

export function AppointmentPage() {
  const crud = useResourceCrud(appointmentApi)
  const clients = useResourceList(clientApi.list)
  const vehicles = useResourceList(vehicleApi.list)
  const services = useResourceList(serviceApi.list)

  const clientNameById = new Map(clients.items.map((client) => [client.id, client.fullName]))
  const licensePlateById = new Map(vehicles.items.map((vehicle) => [vehicle.id, vehicle.licensePlate]))
  const serviceNameById = new Map(services.items.map((service) => [service.id, service.name]))

  const errorMessage =
    crud.errorMessage ?? clients.errorMessage ?? vehicles.errorMessage ?? services.errorMessage

  return (
    <>
      <ApiEndpointLink path={appointmentApi.path} />

      <ErrorBanner message={errorMessage} />

      <AppointmentForm
        key={crud.formKey}
        editingAppointment={crud.editingItem}
        clients={clients.items}
        vehicles={vehicles.items}
        services={services.items}
        onSubmit={crud.submit}
        onCancel={crud.cancelEditing}
      />

      <ResourceTable<Appointment>
        columns={[
          { header: "Cliente", render: (appointment) => clientNameById.get(appointment.clientId) ?? "—" },
          { header: "Veículo", render: (appointment) => licensePlateById.get(appointment.vehicleId) ?? "—" },
          { header: "Data e hora", render: (appointment) => formatDateTime(appointment.scheduledFor) },
          {
            header: "Serviços",
            render: (appointment) =>
              appointment.items.map((item) => serviceNameById.get(item.serviceId) ?? "—").join(", "),
          },
          { header: "Total", render: (appointment) => formatCurrency(appointment.totalPrice) },
          { header: "Duração", render: (appointment) => formatDuration(appointment.totalDurationInMinutes) },
        ]}
        state={crud.listState}
        getRowLabel={(appointment) => licensePlateById.get(appointment.vehicleId) ?? appointment.id}
        emptyMessage="Nenhum agendamento cadastrado."
        onEdit={crud.startEditing}
        onDelete={(appointment) => void crud.remove(appointment)}
      />
    </>
  )
}
