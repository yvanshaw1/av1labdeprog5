import { useState, type ReactNode } from "react"
import { AppointmentPage } from "./pages/AppointmentPage.tsx"
import { ClientPage } from "./pages/ClientPage.tsx"
import { ServicePage } from "./pages/ServicePage.tsx"
import { VehiclePage } from "./pages/VehiclePage.tsx"

interface ResourceTab {
  label: string
  render(): ReactNode
}

const RESOURCE_TABS: ResourceTab[] = [
  { label: "Clientes", render: () => <ClientPage /> },
  { label: "Veículos", render: () => <VehiclePage /> },
  { label: "Serviços", render: () => <ServicePage /> },
  { label: "Agendamentos", render: () => <AppointmentPage /> },
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

      {/* A `key` descarta o estado da aba anterior ao trocar de recurso. */}
      <section key={activeTab.label}>{activeTab.render()}</section>
    </main>
  )
}
