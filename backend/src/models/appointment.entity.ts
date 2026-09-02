import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { AppointmentItem } from "./appointment-item.entity.js"
import { Client } from "./client.entity.js"
import { numericColumnTransformer } from "./numeric-column.transformer.js"
import { Vehicle } from "./vehicle.entity.js"

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "uuid" })
  clientId!: string

  @ManyToOne(() => Client, (client) => client.appointments, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "client_id" })
  client!: Client

  @Column({ type: "uuid" })
  vehicleId!: string

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.appointments, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "vehicle_id" })
  vehicle!: Vehicle

  @Column({ type: "timestamptz" })
  scheduledFor!: Date

  // Totais sao derivados dos itens e gravados pelo servidor. Nunca vem do cliente:
  // aceitar preco do corpo da requisicao permitiria agendar por qualquer valor.
  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericColumnTransformer })
  totalPrice!: number

  @Column({ type: "int" })
  totalDurationInMinutes!: number

  // Sem cascade: a gravacao dos itens e' feita explicitamente pelo repositorio,
  // dentro de uma transacao. O cascade do TypeORM anula a chave estrangeira dos
  // itens removidos em vez de apaga-los, o que viola o NOT NULL da coluna.
  @OneToMany(() => AppointmentItem, (appointmentItem) => appointmentItem.appointment, { eager: true })
  items!: AppointmentItem[]

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
