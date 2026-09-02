import { createResourceApi } from "./resource-api.ts"

export interface Vehicle {
  id: string
  licensePlate: string
  make: string
  model: string
  manufactureYear: number
  color: string
  clientId: string
  createdAt: string
  updatedAt: string
}

/** O `clientId` só vai no cadastro: a API recusa trocar o dono num PUT. */
export interface CreateVehicleInput {
  licensePlate: string
  make: string
  model: string
  manufactureYear: number
  color: string
  clientId: string
}

export type UpdateVehicleInput = Omit<CreateVehicleInput, "clientId">

export const vehicleApi = createResourceApi<Vehicle, CreateVehicleInput | UpdateVehicleInput>("/api/vehicles")
