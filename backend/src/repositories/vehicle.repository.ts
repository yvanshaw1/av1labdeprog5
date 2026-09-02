import type { Vehicle } from "../models/vehicle.entity.js"
import type { CrudRepository } from "./crud.repository.js"

export interface VehicleRepository extends CrudRepository<Vehicle> {
  /** Usado para detectar placa duplicada antes de gravar. */
  findByLicensePlate(licensePlate: string): Promise<Vehicle | null>
}
