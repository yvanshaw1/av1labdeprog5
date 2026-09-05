import { join } from "node:path"
import { createApplication } from "./application.js"
import { connectDatabase } from "./config/connect-database.js"
import { appDataSource } from "./config/data-source.js"
import { environment } from "./config/environment.js"
import { buildTypeOrmRepositories } from "./container.js"

// `src/` e `dist/` estao na mesma profundidade, entao o caminho vale nos dois.
const WEB_APP_DIRECTORY = join(import.meta.dirname, "../../frontend/dist")

async function startServer(): Promise<void> {
  await connectDatabase()

  const application = createApplication(buildTypeOrmRepositories(appDataSource), WEB_APP_DIRECTORY)

  application.listen(environment.PORT, () => {
    console.info(`API ouvindo em http://localhost:${environment.PORT}`)
  })
}

startServer().catch(() => {
  process.exitCode = 1
})
