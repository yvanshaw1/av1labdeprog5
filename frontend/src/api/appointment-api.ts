import { createResourceApi } from "./resource-api.ts"

export interface AppointmentItem {
  id: string
  serviceId: string
  bookedPrice: number
  bookedDurationInMinutes: number
}

export interface Appointment {
  id: string
  clientId: string
  vehicleId: string
  scheduledFor: string
  totalPrice: number
  totalDurationInMinutes: number
  items: AppointmentItem[]
  createdAt: string
  updatedAt: string
}

/**
 * Não há campo de total: quem calcula é o servidor, a partir do preço vigente
 * dos serviços escolhidos. Enviar `totalPrice` faz a API responder 400.
 */
export interface CreateAppointmentInput {
  clientId: string
  vehicleId: string
  scheduledFor: string
  serviceIds: string[]
}

export type UpdateAppointmentInput = Omit<CreateAppointmentInput, "clientId">

export const appointmentApi = createResourceApi<Appointment, CreateAppointmentInput | UpdateAppointmentInput>(
  "/api/appointments",
)
