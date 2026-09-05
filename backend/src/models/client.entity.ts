import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"

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

  @CreateDateColumn({ type: "timestamptz" })
  createdAt!: Date

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt!: Date
}
