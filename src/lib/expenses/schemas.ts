import { z } from "zod"

export const EXPENSE_CATEGORIES = [
  "Software & Subscriptions",
  "Cloud Hosting & Infrastructure",
  "Hardware & Equipment",
  "Internet & Utilities",
  "Platform & Payment Fees",
  "Office & Workspace",
  "Professional Services",
  "Other Business Expense",
] as const

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export const expenseFormSchema = z.object({
  id: z.string().uuid().optional(),
  title: z
    .string()
    .min(2, "Expense title must be at least 2 characters")
    .max(255, "Title must be under 255 characters"),
  originalAmount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  originalCurrency: z.enum(["USD", "EUR", "GBP", "PKR"]),
  exchangeRate: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) > 0),
      {
        message: "Exchange rate must be a positive number",
      }
    ),
  category: z.string().min(1, "Please select an expense category"),
  isTaxDeductible: z.boolean().default(true),
  taxCategory: z.string().optional(),
  expenseDate: z.string().min(10, "Please provide a valid date (YYYY-MM-DD)"),
  documentId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional(),
})

export type ExpenseFormData = z.infer<typeof expenseFormSchema>
