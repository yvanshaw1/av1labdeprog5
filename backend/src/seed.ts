import { connectDatabase } from "./config/connect-database.js"
import { appDataSource } from "./config/data-source.js"
import { buildTypeOrmRepositories } from "./container.js"
import { ClientServiceImpl } from "./services/impl/client.service.impl.js"

/**
 * Repovoa o banco com um cenario de demonstracao.
 *
 * Passa pelos services, e nao direto pelos repositorios, para que os dados
 * nascam das mesmas regras que a API aplica.
 *
 * APAGA tudo o que existe antes de gravar.
 */
async function seed(): Promise<void> {
  await connectDatabase()
  const repositories = buildTypeOrmRepositories(appDataSource)
  const clientService = new ClientServiceImpl(repositories.clientRepository)

  for (const client of await repositories.clientRepository.findAll()) {
    await repositories.clientRepository.deleteById(client.id)
  }

  await clientService.create({
    fullName: "Maria Souza",
    email: "maria@example.com",
    phoneNumber: "(82) 99999-1234",
  })
  await clientService.create({
    fullName: "Joao Lima",
    email: "joao@example.com",
    phoneNumber: "(82) 98888-1111",
  })
  await clientService.create({
    fullName: "Ana Ribeiro",
    email: "ana@example.com",
    phoneNumber: "(82) 97777-2222",
  })

  console.info(`Banco repovoado: ${(await repositories.clientRepository.findAll()).length} clientes`)
  await appDataSource.destroy()
}

seed().catch(() => {
  process.exitCode = 1
})
