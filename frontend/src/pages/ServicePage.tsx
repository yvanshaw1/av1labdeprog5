import { serviceApi, type Service } from "../api/service-api.ts"
import { ApiEndpointLink } from "../components/ApiEndpointLink.tsx"
import { ErrorBanner } from "../components/ErrorBanner.tsx"
import { ResourceTable } from "../components/ResourceTable.tsx"
import { ServiceForm } from "../components/ServiceForm.tsx"
import { useResourceCrud } from "../hooks/useResourceCrud.ts"
import { formatCurrency, formatDuration } from "../lib/formatting.ts"

export function ServicePage() {
  const crud = useResourceCrud(serviceApi)

  return (
    <>
      <ApiEndpointLink path={serviceApi.path} />

      <ErrorBanner message={crud.errorMessage} />

      <ServiceForm
        key={crud.formKey}
        editingService={crud.editingItem}
        onSubmit={crud.submit}
        onCancel={crud.cancelEditing}
      />

      <ResourceTable<Service>
        columns={[
          { header: "Nome", render: (service) => service.name },
          { header: "Descrição", render: (service) => service.description ?? "—" },
          { header: "Preço", render: (service) => formatCurrency(service.price) },
          { header: "Duração", render: (service) => formatDuration(service.durationInMinutes) },
        ]}
        state={crud.listState}
        resourcePath={serviceApi.path}
        getRowLabel={(service) => service.name}
        emptyMessage="Nenhum serviço cadastrado."
        onEdit={crud.startEditing}
        onDelete={(service) => void crud.remove(service)}
      />
    </>
  )
}
