import { clientApi } from "../api/client-api.ts"
import { vehicleApi, type Vehicle } from "../api/vehicle-api.ts"
import { ErrorBanner } from "../components/ErrorBanner.tsx"
import { ResourceTable } from "../components/ResourceTable.tsx"
import { VehicleForm } from "../components/VehicleForm.tsx"
import { useResourceCrud } from "../hooks/useResourceCrud.ts"
import { useResourceList } from "../hooks/useResourceList.ts"

export function VehiclePage() {
  const crud = useResourceCrud(vehicleApi)
  const clients = useResourceList(clientApi.list)

  const clientNameById = new Map(clients.items.map((client) => [client.id, client.fullName]))

  return (
    <>
      <ErrorBanner message={crud.errorMessage ?? clients.errorMessage} />

      <VehicleForm
        key={crud.formKey}
        editingVehicle={crud.editingItem}
        clients={clients.items}
        onSubmit={crud.submit}
        onCancel={crud.cancelEditing}
      />

      <ResourceTable<Vehicle>
        columns={[
          { header: "Placa", render: (vehicle) => vehicle.licensePlate },
          { header: "Marca", render: (vehicle) => vehicle.make },
          { header: "Modelo", render: (vehicle) => vehicle.model },
          { header: "Ano", render: (vehicle) => vehicle.manufactureYear },
          { header: "Cor", render: (vehicle) => vehicle.color },
          // O dono chega como identificador; a tabela mostra o nome.
          { header: "Cliente", render: (vehicle) => clientNameById.get(vehicle.clientId) ?? "—" },
        ]}
        state={crud.listState}
        getRowLabel={(vehicle) => vehicle.licensePlate}
        emptyMessage="Nenhum veículo cadastrado."
        onEdit={crud.startEditing}
        onDelete={(vehicle) => void crud.remove(vehicle)}
      />
    </>
  )
}
