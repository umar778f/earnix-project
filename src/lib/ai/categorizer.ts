import { getGeminiClient, isGeminiConfigured } from "@/lib/ai/gemini-client"
import { INCOME_TAXONOMY, EXPENSE_TAXONOMY } from "@/lib/ai/taxonomy"

export interface CategorizationSuggestion {
  id: string
  title: string
  currentCategory: string
  suggestedCategory: string
  confidence: number // 0.00 to 1.00
  reason: string
  aiModelUsed: string
  taxCategory?: string
  isTaxDeductible?: boolean
}

/**
 * Classifies an income transaction into standard freelancer taxonomy
 */
export async function classifyIncomeTransaction(
  id: string,
  description: string,
  clientName: string,
  amount: number,
  currentCategory: string
): Promise<CategorizationSuggestion> {
  const gemini = getGeminiClient()

  if (gemini && isGeminiConfigured()) {
    try {
      const allowedCategories = INCOME_TAXONOMY.map((t) => t.category).join(", ")
      const prompt = `You are Earnix AI, an intelligent financial categorization assistant for freelancers.
Analyze the following payment record and categorize it into EXACTLY ONE of the allowed categories:
[${allowedCategories}]

Payment Details:
- Description: "${description}"
- Client: "${clientName}"
- Amount: $${amount}

Return ONLY valid JSON matching this exact structure:
{
  "suggestedCategory": "<one of the allowed categories>",
  "confidence": <number between 0.50 and 0.99>,
  "reason": "<short explanation under 120 characters>"
}`

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      })

      const rawText = response.text || ""
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const validCategory = INCOME_TAXONOMY.find(
          (t) => t.category.toLowerCase() === parsed.suggestedCategory?.toLowerCase()
        )

        if (validCategory) {
          return {
            id,
            title: description,
            currentCategory,
            suggestedCategory: validCategory.category,
            confidence: Math.min(Math.max(Number(parsed.confidence) || 0.85, 0.5), 0.98),
            reason: parsed.reason || `Classified as ${validCategory.category} by Gemini AI`,
            aiModelUsed: "gemini-2.5-flash",
          }
        }
      }
    } catch {
      // Graceful fallback to heuristic model if API errors or times out
    }
  }

  // Heuristic rule-based taxonomy classifier (FYP Offline & Resilience Guarantee)
  return classifyIncomeHeuristically(id, description, clientName, currentCategory)
}

function classifyIncomeHeuristically(
  id: string,
  description: string,
  clientName: string,
  currentCategory: string
): CategorizationSuggestion {
  const combined = `${description} ${clientName}`.toLowerCase()

  let bestMatch: (typeof INCOME_TAXONOMY)[number] = INCOME_TAXONOMY[0]
  let maxScore = 0
  let matchedKeywords: string[] = []

  for (const item of INCOME_TAXONOMY) {
    if (item.category === "Freelance Income") continue // default fallback

    let score = 0
    const currentMatches: string[] = []

    for (const kw of item.keywords) {
      if (combined.includes(kw)) {
        score += kw.length > 5 ? 2 : 1
        currentMatches.push(kw)
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = item
      matchedKeywords = currentMatches
    }
  }

  if (maxScore === 0) {
    return {
      id,
      title: description,
      currentCategory,
      suggestedCategory: "Software Development",
      confidence: 0.72,
      reason: "General freelance engineering contract matched by default taxonomy.",
      aiModelUsed: "taxonomy_heuristics_v1",
    }
  }

  const confidence = Math.min(0.75 + maxScore * 0.05, 0.96)
  const highlighted = matchedKeywords.slice(0, 3).map((k) => `"${k}"`).join(", ")

  return {
    id,
    title: description,
    currentCategory,
    suggestedCategory: bestMatch.category,
    confidence: Number(confidence.toFixed(2)),
    reason: `Identified relevant domain terms (${highlighted}) in contract description.`,
    aiModelUsed: "taxonomy_heuristics_v1",
  }
}

/**
 * Classifies a business expense into standard freelancer taxonomy
 */
export async function classifyExpenseRecord(
  id: string,
  title: string,
  amount: number,
  currentCategory: string,
  notes?: string
): Promise<CategorizationSuggestion> {
  const gemini = getGeminiClient()

  if (gemini && isGeminiConfigured()) {
    try {
      const allowedCategories = EXPENSE_TAXONOMY.map((t) => t.category).join(", ")
      const prompt = `You are Earnix AI, an intelligent financial expense categorizer for freelancers.
Analyze the following expense item and categorize it into EXACTLY ONE of the allowed categories:
[${allowedCategories}]

Expense Details:
- Title/Vendor: "${title}"
- Notes: "${notes || ""}"
- Amount: $${amount}

Return ONLY valid JSON matching this exact structure:
{
  "suggestedCategory": "<one of the allowed categories>",
  "confidence": <number between 0.60 and 0.98>,
  "taxCategory": "<official tax classification>",
  "isTaxDeductible": <true or false>,
  "reason": "<short explanation under 120 characters>"
}`

      const response = await gemini.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      })

      const rawText = response.text || ""
      const jsonMatch = rawText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        const validCategory = EXPENSE_TAXONOMY.find(
          (t) => t.category.toLowerCase() === parsed.suggestedCategory?.toLowerCase()
        )

        if (validCategory) {
          return {
            id,
            title,
            currentCategory,
            suggestedCategory: validCategory.category,
            confidence: Math.min(Math.max(Number(parsed.confidence) || 0.85, 0.6), 0.98),
            taxCategory: parsed.taxCategory || validCategory.taxCategory,
            isTaxDeductible: parsed.isTaxDeductible ?? true,
            reason: parsed.reason || `Classified as ${validCategory.category} by Gemini AI`,
            aiModelUsed: "gemini-2.5-flash",
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  // Heuristic rule-based taxonomy classifier for expenses
  return classifyExpenseHeuristically(id, title, currentCategory, notes)
}

function classifyExpenseHeuristically(
  id: string,
  title: string,
  currentCategory: string,
  notes?: string
): CategorizationSuggestion {
  const combined = `${title} ${notes || ""}`.toLowerCase()

  let bestMatch: (typeof EXPENSE_TAXONOMY)[number] = EXPENSE_TAXONOMY[0]
  let maxScore = 0
  let matchedKeywords: string[] = []

  for (const item of EXPENSE_TAXONOMY) {
    let score = 0
    const currentMatches: string[] = []

    for (const kw of item.keywords) {
      if (combined.includes(kw)) {
        score += kw.length > 5 ? 2 : 1
        currentMatches.push(kw)
      }
    }

    if (score > maxScore) {
      maxScore = score
      bestMatch = item
      matchedKeywords = currentMatches
    }
  }

  const confidence = maxScore > 0 ? Math.min(0.78 + maxScore * 0.05, 0.96) : 0.75
  const highlighted =
    matchedKeywords.length > 0
      ? `domain keywords (${matchedKeywords.slice(0, 3).map((k) => `"${k}"`).join(", ")})`
      : "operational cost heuristics"

  return {
    id,
    title,
    currentCategory,
    suggestedCategory: bestMatch.category,
    confidence: Number(confidence.toFixed(2)),
    taxCategory: bestMatch.taxCategory,
    isTaxDeductible: true,
    reason: `Matched ${highlighted} to substantiate business deductibility.`,
    aiModelUsed: "taxonomy_heuristics_v1",
  }
}
