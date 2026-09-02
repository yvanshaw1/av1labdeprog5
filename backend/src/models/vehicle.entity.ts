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
import { Appointment } from "./appointment.entity.js"
import { Client } from "./client.entity.js"

@Entity("vehicles")
export class Vehicle {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar", length: 10, unique: true })
  licensePlate!: string

  @Column({ type: "varchar", length: 60 })
  make!: string

  @Column({ type: "varchar", length: 60 })
  model!: string

  @Column({ type: "int" })
  manufactureYear!: number

  @Column({ type: "varchar", length: 40 })
  color!: string

  @Column({ type: "uuid" })
  clientId!: string

  @ManyToOne(() => Client, (client) => client.vehicles, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "client_id" })
  client!: Client

  @OneToMany(() => Appointment, (appointment) => appointment.vehicle)
  appointments!: Appointment[]

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
