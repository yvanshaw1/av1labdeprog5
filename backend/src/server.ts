import { join } from "node:path"
import { createApplication } from "./application.js"
import { appDataSource } from "./config/data-source.js"
import { environment } from "./config/environment.js"
import { buildTypeOrmRepositories } from "./container.js"

// `src/` e `dist/` estao na mesma profundidade, entao o caminho vale nos dois.
const WEB_APP_DIRECTORY = join(import.meta.dirname, "../../frontend/dist")

async function startServer(): Promise<void> {
  await appDataSource.initialize()

  const application = createApplication(buildTypeOrmRepositories(appDataSource), WEB_APP_DIRECTORY)

  application.listen(environment.PORT, () => {
    console.info(`API ouvindo em http://localhost:${environment.PORT}`)
  })
}

startServer().catch((error: unknown) => {
  console.error("Falha ao iniciar a aplicacao:", error)
  process.exitCode = 1
})
