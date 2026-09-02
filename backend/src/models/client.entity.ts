import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm"
import { Appointment } from "./appointment.entity.js"
import { Vehicle } from "./vehicle.entity.js"

@Entity("clients")
export class Client {
  @PrimaryGeneratedColumn("uuid")
  id!: string

  @Column({ type: "varchar", length: 120 })
  fullName!: string

  @Column({ type: "varchar", length: 160, unique: true })
  email!: string

  @Column({ type: "varchar", length: 20 })
  phoneNumber!: string

  @OneToMany(() => Vehicle, (vehicle) => vehicle.client)
  vehicles!: Vehicle[]

  @OneToMany(() => Appointment, (appointment) => appointment.client)
  appointments!: Appointment[]

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
