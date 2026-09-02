import { z } from "zod"

// Aceita os formatos usados no Brasil: "(82) 99999-1234", "82999991234", "+55 82 99999-1234".
const PHONE_NUMBER_PATTERN = /^[0-9()+\-\s]{10,20}$/

export const createClientRequestSchema = z
  .object({
    fullName: z.string().trim().min(3, "Full name must have at least 3 characters.").max(120),
    email: z
      .email("Invalid email address.")
      .max(160)
      .transform((value) => value.toLowerCase()),
    phoneNumber: z
      .string()
      .trim()
      .regex(PHONE_NUMBER_PATTERN, "Phone number must contain 10 to 20 digits, spaces, parentheses, plus or hyphen."),
  })
  // `strict` recusa chaves desconhecidas: sem isso, um `id` ou `createdAt` no
  // corpo passaria silenciosamente e daria a impressao de ter sido aceito.
  .strict()

export type CreateClientRequestDto = z.infer<typeof createClientRequestSchema>
