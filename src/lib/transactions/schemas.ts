import { z } from "zod"

const PG_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const transactionSchema = z.object({
  clientId: z
    .string()
    .trim()
    .regex(PG_UUID_REGEX, "Please select a valid client")
    .or(z.literal(""))
    .optional(),
  platformId: z
    .string()
    .trim()
    .regex(PG_UUID_REGEX, "Please select a valid platform")
    .or(z.literal(""))
    .optional(),
  originalAmount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  originalCurrency: z
    .string()
    .trim()
    .min(3, "Currency must be 3 characters")
    .max(3, "Currency must be 3 characters")
    .toUpperCase(),
  exchangeRate: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
      message: "Exchange rate must be a positive number",
    }),
  paymentDate: z.string().trim().min(1, "Payment date is required"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description too long"),
  referenceId: z.string().trim().max(100, "Reference ID too long").optional(),
  status: z.enum(["completed", "pending", "refunded"]).default("completed"),
  category: z.string().trim().min(1, "Category is required").max(100).default("Freelance Income"),
})

export type TransactionInput = z.infer<typeof transactionSchema>
