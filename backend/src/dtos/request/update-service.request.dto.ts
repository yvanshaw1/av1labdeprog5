import type { z } from "zod"
import { createServiceRequestSchema } from "./create-service.request.dto.js"

// PUT substitui o recurso inteiro, entao exige os mesmos campos da criacao.
export const updateServiceRequestSchema = createServiceRequestSchema

export type UpdateServiceRequestDto = z.infer<typeof updateServiceRequestSchema>
