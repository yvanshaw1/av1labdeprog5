import { createApplication } from "./application.js"
import { appDataSource } from "./config/data-source.js"
import { environment } from "./config/environment.js"
import { buildTypeOrmRepositories } from "./container.js"

async function startServer(): Promise<void> {
  await appDataSource.initialize()

  const application = createApplication(buildTypeOrmRepositories(appDataSource))

  application.listen(environment.PORT, () => {
    console.info(`API ouvindo em http://localhost:${environment.PORT}`)
  })
}

startServer().catch((error: unknown) => {
  console.error("Falha ao iniciar a aplicacao:", error)
  process.exitCode = 1
})
