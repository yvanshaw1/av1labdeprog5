import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Appointment } from "./appointment.entity.js"
import { numericColumnTransformer } from "./numeric-column.transformer.js"
import { Service } from "./service.entity.js"

/**
 * Liga agendamento e servico (relacao N:N) guardando o preco e a duracao
 * vigentes no momento da marcacao. Sem esse retrato, reajustar o catalogo
 * mudaria retroativamente o valor de agendamentos ja fechados.
 */
@Entity("appointment_items")
export class AppointmentItem {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  appointmentId!: string

  @ManyToOne(() => Appointment, (appointment) => appointment.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "appointment_id" })
  appointment!: Appointment

  @Column({ type: "uuid" })
  serviceId!: string

  @ManyToOne(() => Service, (service) => service.appointmentItems, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "service_id" })
  service!: Service

  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericColumnTransformer })
  bookedPrice!: number

  @Column({ type: "int" })
  bookedDurationInMinutes!: number
}
