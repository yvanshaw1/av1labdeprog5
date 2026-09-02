import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { AppointmentItem } from "./appointment-item.entity.js"
import { numericColumnTransformer } from "./numeric-column.transformer.js"

/** Servico do catalogo (lavagem, polimento, vitrificacao). */
@Entity("services")
export class Service {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar", length: 120, unique: true })
  name!: string

  @Column({ type: "varchar", length: 400, nullable: true })
  description!: string | null

  @Column({ type: "numeric", precision: 10, scale: 2, transformer: numericColumnTransformer })
  price!: number

  @Column({ type: "int" })
  durationInMinutes!: number

  @OneToMany(() => AppointmentItem, (appointmentItem) => appointmentItem.service)
  appointmentItems!: AppointmentItem[]

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
