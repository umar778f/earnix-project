export const IRRELEVANT_SENTINEL = "[IRRELEVANT_QUERY]"

export const IRRELEVANT_QUERY_RESPONSE =
  "Your asked question is irrelevant to your Earnix financial ledger. I can only answer questions about your freelance income, business expenses, clients, currency conversions, and tax estimates. Please choose one of the 4 suggested questions below or ask something related to your finances."

export const DEFAULT_COPILOT_QUESTIONS: readonly string[] = [
  "What was my total gross income from Upwork?",
  "What are my total business expenses and deductible costs?",
  "What is my estimated taxable net income and recommended tax reserve?",
  "Which client generated the highest revenue this year?",
]

export type CopilotTopic = "general" | "income" | "expenses" | "tax" | "irrelevant"

const TOPIC_FOLLOW_UPS: Record<CopilotTopic, readonly string[]> = {
  general: DEFAULT_COPILOT_QUESTIONS,
  irrelevant: DEFAULT_COPILOT_QUESTIONS,
  income: [
    "What is my estimated taxable net income and recommended tax reserve?",
    "What are my total business expenses and deductible costs?",
    "Which client generated the highest revenue this year?",
    "How do you calculate my 1% freelance tax reserve?",
  ],
  expenses: [
    "How much did I spend on cloud hosting and software subscriptions?",
    "What is my estimated taxable net income and recommended tax reserve?",
    "What was my total gross income from Upwork?",
    "How do deductible expenses reduce my taxable income?",
  ],
  tax: [
    "How do you calculate my 1% freelance tax reserve?",
    "What are my total business expenses and deductible costs?",
    "What was my total gross income from Upwork?",
    "Which client generated the highest revenue this year?",
  ],
}

const EXTRA_FOLLOW_UPS: readonly string[] = [
  "Give me a full summary of my freelance ledger.",
  "How much did I spend on software subscriptions?",
  "How do you calculate my 1% freelance tax reserve?",
  "What is my net income after business expenses?",
]

export interface RelevanceContext {
  clientNames?: string[]
  platformNames?: string[]
  expenseTitles?: string[]
  expenseCategories?: string[]
}

const PROMPT_INJECTION_PATTERNS: readonly RegExp[] = [
  /\b(ignore|disregard|forget)\s+(all\s+|any\s+|your\s+)?(previous|prior|above|system)\s+(instructions|prompts|rules)\b/i,
  /\b(act\s+as|pretend\s+to\s+be|you\s+are\s+now|jailbreak|dan\s+mode)\b/i,
]

const OFF_TOPIC_INTENT_PATTERN =
  /\b(joke|jokes|poem|poetry|story|stories|song|songs|lyrics|riddle|recipe|cook|cooking|weather|forecast|cricket|football|soccer|basketball|movie|movies|netflix|anime|horoscope|astrology|president|prime minister|capital of|write code|python script|javascript code|translate)\b/i

const STRONG_LEDGER_PATTERN =
  /\b(earnix|upwork|fiverr|toptal|payoneer|wise|fbr|154a|pseb|my income|my earnings|my expenses|my tax|my ledger|my revenue|my clients|deductible|tax reserve|gross income|net income|taxable income)\b/i

const FINANCIAL_DOMAIN_PATTERN =
  /\b(earnix|income|earning|earnings|revenue|payment|payments|payout|payouts|remittance|remittances|gross|profit|profits|loss|balance|balances|ledger|cashflow|cash flow|transaction|transactions|inflow|outflow|finance|finances|financial|bookkeeping|accounting|freelance|freelancer|freelancers|milestone|milestones|contract|contracts|billing|invoice|invoices|receipt|receipts|statement|statements|csv|salary|retainer|deposit|deposits|withdrawal|withdrawals|bank|banking|budget|savings|payable|expense|expenses|spend|spending|spent|cost|costs|deduct|deductible|deduction|deductions|cloud|hosting|aws|software|subscription|subscriptions|hardware|equipment|fee|fees|vendor|vendors|overhead|operating|operational|upwork|fiverr|toptal|payoneer|wise|stripe|paypal|deel|platform|platforms|client|clients|customer|customers|tax|taxes|taxable|taxation|fbr|irs|hmrc|154a|pseb|withholding|wht|reserve|reserves|filing|audit|compliance|regime|jurisdiction|liability|refund|credit|credits|currency|currencies|pkr|usd|eur|gbp|aed|cad|aud|exchange|fx|convert|conversion|converted|dollar|dollars|rupee|rupees|dashboard|copilot|vault|document|documents|report|reports|monthly|yearly|quarterly|annual|summary|overview|net income|net profit|net taxable|net balance|net earnings|net revenue|how does earnix work|what can you do)\b/i

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Deterministic scope guard verifying whether a user question pertains to
 * Earnix freelance bookkeeping, ledger metrics, clients, expenses, or tax estimates.
 */
export function isRelevantCopilotQuery(
  query: string,
  context?: RelevanceContext
): boolean {
  const trimmed = query.trim()
  if (trimmed.length < 2) {
    return false
  }

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return false
    }
  }

  const lower = trimmed.toLowerCase()

  // Reject blatantly off-topic creative/trivia queries unless strongly anchored in ledger terms
  if (OFF_TOPIC_INTENT_PATTERN.test(lower) && !STRONG_LEDGER_PATTERN.test(lower)) {
    return false
  }

  if (FINANCIAL_DOMAIN_PATTERN.test(lower)) {
    return true
  }

  // Also check if the query references any known client, platform, or expense from the user's ledger
  if (context) {
    const entityLists = [
      context.clientNames ?? [],
      context.platformNames ?? [],
      context.expenseTitles ?? [],
      context.expenseCategories ?? [],
    ]

    for (const list of entityLists) {
      for (const rawEntity of list) {
        const entity = rawEntity.trim().toLowerCase()
        if (entity.length >= 3) {
          const entityRegex = new RegExp(`\\b${escapeRegex(entity)}\\b`, "i")
          if (entityRegex.test(lower)) {
            return true
          }
        }
      }
    }
  }

  return false
}

/**
 * Returns exactly 4 suggested follow-up questions tailored to the current topic,
 * excluding the exact question the user just asked.
 */
export function getFollowUpQuestions(
  lastQuery?: string,
  topic: CopilotTopic = "general"
): string[] {
  if (topic === "irrelevant" || !lastQuery?.trim()) {
    return [...DEFAULT_COPILOT_QUESTIONS]
  }

  const normalizedLast = lastQuery.trim().toLowerCase().replace(/[?.!]+$/, "")
  const candidates = [
    ...TOPIC_FOLLOW_UPS[topic],
    ...DEFAULT_COPILOT_QUESTIONS,
    ...EXTRA_FOLLOW_UPS,
  ]

  const result: string[] = []
  const seen = new Set<string>()

  for (const q of candidates) {
    const norm = q.trim().toLowerCase().replace(/[?.!]+$/, "")
    if (norm === normalizedLast || seen.has(norm)) {
      continue
    }
    seen.add(norm)
    result.push(q)
    if (result.length === 4) {
      break
    }
  }

  return result
}
