"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface FaqItem {
  question: string
  answer: string
}

const FAQS: FaqItem[] = [
  {
    question: "Is Earnix free to use?",
    answer:
      "Yes. Earnix is free for independent freelancers and consultants. You can track multi-currency income, import platform CSV statements, attach expense receipts, and generate tax reserve reports without paying subscription fees.",
  },
  {
    question: "Which CSV statement formats are supported?",
    answer:
      "Earnix provides native support for Upwork Transaction History CSV statements, automatically separating gross earnings, escrow milestones, and 10% service fee deductions. You can also import standard bank export statements and generic client invoice CSVs with smart column mapping.",
  },
  {
    question: "How is my financial data kept private and secure?",
    answer:
      "Every financial entry, client record, and uploaded document is strictly partitioned at the database layer using PostgreSQL Row Level Security (RLS). No other user or external entity can query or access your records. Receipt attachments are stored in an encrypted, private storage bucket accessible only through your authenticated session.",
  },
  {
    question: "Which tax regimes are supported?",
    answer:
      "Earnix provides automated reserve calculations for Pakistan FBR Section 154A (1.00% final tax benchmark on gross export proceeds for registered IT and freelance services), US IRS self-employment baseline (15.3%), UK HMRC sole trader baseline (9.0%), and a customizable generic rate for any international tax jurisdiction.",
  },
  {
    question: "How does dual-currency conversion work?",
    answer:
      "Whenever you record an income payment in USD, EUR, or GBP, Earnix records both the original contract currency amount and the converted local currency (e.g. PKR) using the verified exchange rate on the transaction date. All calculations use arbitrary-precision decimal arithmetic (Decimal.js) so you never experience IEEE-754 floating-point rounding drift.",
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <div className="space-y-3">
      {FAQS.map((faq, idx) => {
        const isOpen = openIndex === idx
        return (
          <div
            key={idx}
            className="rounded-xl border border-border bg-card shadow-xs transition-colors"
          >
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={cn(
                  "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
                  isOpen && "rotate-180 text-foreground"
                )}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/40 mt-1 pt-3">
                {faq.answer}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

