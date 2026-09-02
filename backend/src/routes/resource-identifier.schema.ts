import { z } from "zod"

/** Valida o `:id` das rotas de recurso antes que ele chegue ao banco. */
export const resourceIdentifierSchema = z.object({
  id: z.uuid("Identifier must be a valid UUID."),
})

export type ResourceIdentifierParameters = z.infer<typeof resourceIdentifierSchema>
