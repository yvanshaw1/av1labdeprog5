import { useState, type ReactNode } from "react"
import { SourceExplorer } from "./components/SourceExplorer.tsx"
import { AppointmentPage } from "./pages/AppointmentPage.tsx"
import { ClientPage } from "./pages/ClientPage.tsx"
import { ServicePage } from "./pages/ServicePage.tsx"
import { VehiclePage } from "./pages/VehiclePage.tsx"

interface ResourceTab {
  label: string
  /** Casa a aba com o recurso na API e com os arquivos mostrados ao lado. */
  resource: string
  render(): ReactNode
}

const RESOURCE_TABS: ResourceTab[] = [
  { label: "Clientes", resource: "clients", render: () => <ClientPage /> },
  { label: "Veículos", resource: "vehicles", render: () => <VehiclePage /> },
  { label: "Serviços", resource: "services", render: () => <ServicePage /> },
  { label: "Agendamentos", resource: "appointments", render: () => <AppointmentPage /> },
]

export function App() {
  const [activeTabLabel, setActiveTabLabel] = useState(RESOURCE_TABS[0]!.label)
  const activeTab = RESOURCE_TABS.find((tab) => tab.label === activeTabLabel) ?? RESOURCE_TABS[0]!

  return (
    <main className="page">
      <h1>Agendamento de Estética Automotiva</h1>

      <nav className="tab-bar">
        {RESOURCE_TABS.map((tab) => (
          <button
            key={tab.label}
            type="button"
            className={tab.label === activeTabLabel ? "tab tab-active" : "tab"}
            aria-current={tab.label === activeTabLabel ? "page" : undefined}
            onClick={() => setActiveTabLabel(tab.label)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="workspace">
        {/* A `key` descarta o estado da aba anterior ao trocar de recurso. */}
        <section key={activeTab.label} className="workspace-app">
          {activeTab.render()}
        </section>

        <aside className="workspace-code" aria-label="Código-fonte deste recurso">
          <SourceExplorer resource={activeTab.resource} />
        </aside>
      </div>
    </main>
  )
}
