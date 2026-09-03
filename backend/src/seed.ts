import { appDataSource } from "./config/data-source.js"
import { buildTypeOrmRepositories } from "./container.js"
import { AppointmentService } from "./services/appointment.service.js"
import { ClientService } from "./services/client.service.js"
import { ServiceService } from "./services/service.service.js"
import { VehicleService } from "./services/vehicle.service.js"

/**
 * Repovoa o banco com um cenario de demonstracao.
 *
 * Passa pelos services, e nao direto pelos repositorios, para que os dados
 * nascam das mesmas regras que a API aplica — o total do agendamento, por
 * exemplo, e' calculado a partir do catalogo, nunca escrito aqui.
 *
 * APAGA tudo o que existe antes de gravar.
 */
async function seed(): Promise<void> {
  await appDataSource.initialize()
  const repositories = buildTypeOrmRepositories(appDataSource)

  const clientService = new ClientService(repositories.clientRepository)
  const vehicleService = new VehicleService(repositories.vehicleRepository, repositories.clientRepository)
  const serviceService = new ServiceService(repositories.serviceRepository)
  const appointmentService = new AppointmentService(repositories)

  await eraseEverything(repositories)

  const maria = await clientService.create({
    fullName: "Maria Souza",
    email: "maria@example.com",
    phoneNumber: "(82) 99999-1234",
  })
  const joao = await clientService.create({
    fullName: "Joao Lima",
    email: "joao@example.com",
    phoneNumber: "(82) 98888-1111",
  })
  // Sem veiculo de proposito: e' o cliente que pode ser excluido na demonstracao.
  await clientService.create({
    fullName: "Ana Ribeiro",
    email: "ana@example.com",
    phoneNumber: "(82) 97777-2222",
  })

  const corolla = await vehicleService.create({
    licensePlate: "ABC1D23",
    make: "Toyota",
    model: "Corolla",
    manufactureYear: 2022,
    color: "Prata",
    clientId: maria.id,
  })
  const civic = await vehicleService.create({
    licensePlate: "XYZ9K88",
    make: "Honda",
    model: "Civic",
    manufactureYear: 2020,
    color: "Preto",
    clientId: joao.id,
  })

  const lavagem = await serviceService.create({
    name: "Lavagem completa",
    description: "Lavagem externa, interna e higienizacao dos bancos.",
    price: 150,
    durationInMinutes: 90,
  })
  const polimento = await serviceService.create({
    name: "Polimento tecnico",
    description: "Correcao de riscos finos e realce do brilho da pintura.",
    price: 320.5,
    durationInMinutes: 240,
  })
  const vitrificacao = await serviceService.create({
    name: "Vitrificacao",
    description: "Camada ceramica de protecao da pintura.",
    price: 890,
    durationInMinutes: 420,
  })

  await appointmentService.create({
    clientId: maria.id,
    vehicleId: corolla.id,
    scheduledFor: new Date("2026-09-15T13:30:00.000Z"),
    serviceIds: [lavagem.id],
  })
  // Dois servicos: mostra o total somado pelo servidor.
  await appointmentService.create({
    clientId: joao.id,
    vehicleId: civic.id,
    scheduledFor: new Date("2026-09-18T10:00:00.000Z"),
    serviceIds: [polimento.id, vitrificacao.id],
  })

  await report(repositories)
  await appDataSource.destroy()
}

/** A ordem respeita as chaves estrangeiras: agendamento, veiculo, servico, cliente. */
async function eraseEverything(repositories: ReturnType<typeof buildTypeOrmRepositories>): Promise<void> {
  for (const appointment of await repositories.appointmentRepository.findAll()) {
    await repositories.appointmentRepository.deleteById(appointment.id)
  }
  for (const vehicle of await repositories.vehicleRepository.findAll()) {
    await repositories.vehicleRepository.deleteById(vehicle.id)
  }
  for (const service of await repositories.serviceRepository.findAll()) {
    await repositories.serviceRepository.deleteById(service.id)
  }
  for (const client of await repositories.clientRepository.findAll()) {
    await repositories.clientRepository.deleteById(client.id)
  }
}

async function report(repositories: ReturnType<typeof buildTypeOrmRepositories>): Promise<void> {
  const appointments = await repositories.appointmentRepository.findAll()
  console.info("Banco repovoado:")
  console.info(`  ${(await repositories.clientRepository.findAll()).length} clientes`)
  console.info(`  ${(await repositories.vehicleRepository.findAll()).length} veiculos`)
  console.info(`  ${(await repositories.serviceRepository.findAll()).length} servicos`)
  console.info(`  ${appointments.length} agendamentos`)
  for (const appointment of appointments) {
    console.info(`    total R$ ${appointment.totalPrice} em ${appointment.totalDurationInMinutes} min`)
  }
}

seed().catch((error: unknown) => {
  console.error("Falha ao repovoar o banco:", error)
  process.exitCode = 1
})
