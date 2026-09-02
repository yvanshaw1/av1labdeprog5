import type { DataSource, EntityManager } from "typeorm"
import { Appointment } from "../../models/appointment.entity.js"
import { AppointmentItem } from "../../models/appointment-item.entity.js"
import type { AppointmentRepository } from "../appointment.repository.js"
import { translatingConstraintViolations } from "./constraint-violation.js"
import { TypeOrmCrudRepository } from "./typeorm-crud.repository.js"

/**
 * Copia do agendamento sem a propriedade `items`.
 *
 * Enquanto a relacao estiver presente no objeto, o TypeORM tenta reconciliar a
 * lista sozinho e desliga os itens que sairam anulando `appointment_id` — coluna
 * NOT NULL. Ausente, ele grava so as colunas do agendamento.
 */
function withoutItems(appointment: Appointment): Appointment {
  const { items: _items, ...appointmentColumns } = appointment
  return Object.assign(new Appointment(), appointmentColumns)
}

export class TypeOrmAppointmentRepository
  extends TypeOrmCrudRepository<Appointment>
  implements AppointmentRepository
{
  // `items` e' relacao eager na entidade, entao vem carregada em toda leitura.
  constructor(private readonly dataSource: DataSource) {
    super(dataSource, Appointment, { scheduledFor: "ASC" })
  }

  /**
   * Grava o agendamento e substitui a lista de itens, numa transacao.
   *
   * A substituicao e' explicita — apaga os itens atuais e insere os novos —
   * porque e' isso que o PUT significa: o agendamento inteiro e' trocado. Deixar
   * isso a cargo do cascade do TypeORM nao funciona: ele desliga os itens
   * removidos anulando `appointment_id`, coluna que e' NOT NULL.
   */
  override async save(appointment: Appointment): Promise<Appointment> {
    const itemsToPersist = appointment.items ?? []

    return translatingConstraintViolations(() =>
      this.dataSource.transaction(async (entityManager) => {
        const savedAppointment = await entityManager.save(Appointment, withoutItems(appointment))

        await entityManager.delete(AppointmentItem, { appointmentId: savedAppointment.id })
        savedAppointment.items = await insertItems(entityManager, savedAppointment.id, itemsToPersist)

        return savedAppointment
      }),
    )
  }
}

/**
 * Insere copias novas dos itens. Os originais podem carregar o `id` de linhas
 * que acabaram de ser apagadas — reaproveita-los faria o TypeORM tentar um
 * update em vez de um insert.
 */
async function insertItems(
  entityManager: EntityManager,
  appointmentId: string,
  items: readonly AppointmentItem[],
): Promise<AppointmentItem[]> {
  if (items.length === 0) {
    return []
  }

  return entityManager.save(
    items.map((item) =>
      entityManager.create(AppointmentItem, {
        appointmentId,
        serviceId: item.serviceId,
        bookedPrice: item.bookedPrice,
        bookedDurationInMinutes: item.bookedDurationInMinutes,
      }),
    ),
  )
}
