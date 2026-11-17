import { z } from "zod"

const PG_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const clientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Client name is required")
    .max(100, "Client name too long"),
  email: z.string().trim().email("Please enter a valid email address").or(z.literal("")).optional(),
  country: z.string().trim().max(60, "Country name too long").optional(),
  defaultPlatformId: z
    .string()
    .trim()
    .regex(PG_UUID_REGEX, "Please select a valid platform")
    .or(z.literal(""))
    .optional(),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
})

export type ClientInput = z.infer<typeof clientSchema>
