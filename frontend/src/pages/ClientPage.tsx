import { clientApi, type Client } from "../api/client-api.ts"
import { ClientForm } from "../components/ClientForm.tsx"
import { ErrorBanner } from "../components/ErrorBanner.tsx"
import { ResourceTable } from "../components/ResourceTable.tsx"
import { useResourceCrud } from "../hooks/useResourceCrud.ts"

export function ClientPage() {
  const crud = useResourceCrud(clientApi)

  return (
    <>
      <ErrorBanner message={crud.errorMessage} />

      {/* A `key` remonta o formulário ao trocar de cliente ou após gravar,
          zerando os campos sem sincronizar estado manualmente. */}
      <ClientForm
        key={crud.formKey}
        editingClient={crud.editingItem}
        onSubmit={crud.submit}
        onCancel={crud.cancelEditing}
      />

      <ResourceTable<Client>
        columns={[
          { header: "Nome", render: (client) => client.fullName },
          { header: "E-mail", render: (client) => client.email },
          { header: "Telefone", render: (client) => client.phoneNumber },
        ]}
        state={crud.listState}
        getRowLabel={(client) => client.fullName}
        emptyMessage="Nenhum cliente cadastrado."
        onEdit={crud.startEditing}
        onDelete={(client) => void crud.remove(client)}
      />
    </>
  )
}
