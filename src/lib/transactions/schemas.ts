import { z } from "zod"

export const transactionSchema = z.object({
  clientId: z.string().uuid("Invalid client ID").or(z.literal("")).optional(),
  platformId: z.string().uuid("Please select a valid platform"),
  originalAmount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  originalCurrency: z
    .string()
    .min(3, "Currency must be 3 characters")
    .max(3, "Currency must be 3 characters")
    .toUpperCase(),
  exchangeRate: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0), {
      message: "Exchange rate must be a positive number",
    }),
  paymentDate: z.string().min(1, "Payment date is required"),
  description: z.string().min(3, "Description must be at least 3 characters").max(255, "Description too long"),
  referenceId: z.string().max(100, "Reference ID too long").optional(),
  status: z.enum(["completed", "pending", "refunded"]),
  category: z.string().min(2, "Category is required").max(100),
})

export type TransactionInput = z.infer<typeof transactionSchema>

