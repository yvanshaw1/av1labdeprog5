import { z } from "zod"

export const createAppointmentRequestSchema = z
  .object({
    clientId: z.uuid("Client identifier must be a valid UUID."),
    vehicleId: z.uuid("Vehicle identifier must be a valid UUID."),
    // Exigir o fuso evita que "13:30" signifique horarios diferentes para
    // cliente e servidor. O valor e' guardado em UTC.
    scheduledFor: z.iso
      .datetime({ offset: true, message: "Scheduled date must be an ISO 8601 date and time including the time zone." })
      .transform((value) => new Date(value)),
    serviceIds: z
      .array(z.uuid("Service identifier must be a valid UUID."))
      .min(1, "At least one service must be selected.")
      .refine(
        (serviceIds) => new Set(serviceIds).size === serviceIds.length,
        "The same service must not be selected more than once.",
      ),
  })
  // Recusar chaves desconhecidas e' o que impede o cliente de enviar `totalPrice`:
  // o total sai sempre do preco vigente no catalogo, calculado no servidor.
  .strict()

export type CreateAppointmentRequestDto = z.infer<typeof createAppointmentRequestSchema>
