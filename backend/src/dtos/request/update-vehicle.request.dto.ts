import type { z } from "zod"
import { createVehicleRequestSchema } from "./create-vehicle.request.dto.js"

// `clientId` fica de fora: trocar o dono de um veiculo e' um novo cadastro,
// nao a edicao do existente.
export const updateVehicleRequestSchema = createVehicleRequestSchema.omit({ clientId: true })

export type UpdateVehicleRequestDto = z.infer<typeof updateVehicleRequestSchema>
