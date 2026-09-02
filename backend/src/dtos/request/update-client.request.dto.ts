import type { z } from "zod"
import { createClientRequestSchema } from "./create-client.request.dto.js"

// PUT substitui o recurso inteiro, entao exige os mesmos campos da criacao.
export const updateClientRequestSchema = createClientRequestSchema

export type UpdateClientRequestDto = z.infer<typeof updateClientRequestSchema>
