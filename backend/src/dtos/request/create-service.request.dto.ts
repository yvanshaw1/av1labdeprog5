import { z } from "zod"

const MINUTES_IN_ONE_DAY = 1440

export const createServiceRequestSchema = z
  .object({
    name: z.string().trim().min(3, "Service name must have at least 3 characters.").max(120),
    description: z.string().trim().max(400).nullable().default(null),
    price: z
      .number()
      .positive("Price must be greater than zero.")
      .multipleOf(0.01, "Price must have at most 2 decimal places."),
    durationInMinutes: z
      .number()
      .int("Duration must be a whole number of minutes.")
      .positive("Duration must be greater than zero.")
      .max(MINUTES_IN_ONE_DAY, `Duration must not exceed ${MINUTES_IN_ONE_DAY} minutes.`),
  })
  .strict()

export type CreateServiceRequestDto = z.infer<typeof createServiceRequestSchema>
