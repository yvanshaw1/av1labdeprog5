import { z } from "zod"

// Placa antiga (ABC1234) e placa Mercosul (ABC1D23).
const LICENSE_PLATE_PATTERN = /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/

const FIRST_AUTOMOBILE_YEAR = 1886

// Montadoras lancam o modelo do ano seguinte ainda no ano corrente. Calculado a
// cada validacao: fixar no carregamento do modulo faria um processo que
// atravessa a virada do ano recusar os modelos novos.
function latestModelYear(): number {
  return new Date().getFullYear() + 1
}

export const createVehicleRequestSchema = z
  .object({
    licensePlate: z
      .string()
      .trim()
      .transform((value) => value.toUpperCase())
      .pipe(z.string().regex(LICENSE_PLATE_PATTERN, "License plate must follow the Brazilian format ABC1234 or ABC1D23.")),
    make: z.string().trim().min(1, "Make is required.").max(60),
    model: z.string().trim().min(1, "Model is required.").max(60),
    manufactureYear: z
      .number()
      .int("Manufacture year must be a whole number.")
      .min(FIRST_AUTOMOBILE_YEAR, `Manufacture year must be ${FIRST_AUTOMOBILE_YEAR} or later.`)
      .refine((year) => year <= latestModelYear(), "Manufacture year must not exceed next year's model."),
    color: z.string().trim().min(1, "Color is required.").max(40),
    clientId: z.uuid("Client identifier must be a valid UUID."),
  })
  .strict()

export type CreateVehicleRequestDto = z.infer<typeof createVehicleRequestSchema>
