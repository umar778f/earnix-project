import { z } from "zod"

export const clientSchema = z.object({
  name: z.string().min(2, "Client name must be at least 2 characters").max(100, "Client name too long"),
  email: z.string().email("Please enter a valid email address").or(z.literal("")).optional(),
  country: z.string().max(60, "Country name too long").optional(),
  defaultPlatformId: z.string().uuid("Invalid platform ID").or(z.literal("")).optional(),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
})

export type ClientInput = z.infer<typeof clientSchema>

