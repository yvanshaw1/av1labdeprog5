import type { z } from "zod"
import { createAppointmentRequestSchema } from "./create-appointment.request.dto.js"

// `clientId` fica de fora: transferir um agendamento para outro cliente seria
// um novo agendamento, nao a edicao do existente.
export const updateAppointmentRequestSchema = createAppointmentRequestSchema.omit({ clientId: true })

export type UpdateAppointmentRequestDto = z.infer<typeof updateAppointmentRequestSchema>
