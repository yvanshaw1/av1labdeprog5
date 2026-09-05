import { ClientPage } from "./pages/ClientPage.tsx"
import { SourceExplorer } from "./components/SourceExplorer.tsx"

export function App() {
  return (
    <main className="page">
      <h1>Cadastro de Cliente</h1>

      <div className="workspace">
        <section className="workspace-app">
          <ClientPage />
        </section>

        <aside className="workspace-code" aria-label="Código-fonte da API">
          <SourceExplorer />
        </aside>
      </div>
    </main>
  )
}
