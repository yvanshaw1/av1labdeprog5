import type { DataSource } from "typeorm"
import { Vehicle } from "../../models/vehicle.entity.js"
import type { VehicleRepository } from "../vehicle.repository.js"
import { TypeOrmCrudRepository } from "./typeorm-crud.repository.js"

export class TypeOrmVehicleRepository extends TypeOrmCrudRepository<Vehicle> implements VehicleRepository {
  constructor(dataSource: DataSource) {
    super(dataSource, Vehicle, { createdAt: "ASC" })
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return this.repository.findOneBy({ licensePlate })
  }
}
