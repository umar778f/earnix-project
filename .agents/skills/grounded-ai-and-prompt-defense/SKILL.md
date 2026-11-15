---
name: grounded-ai-and-prompt-defense
description: >-
  Use this skill whenever working with the Gemini Copilot, AI transaction categorizers, RAG pipelines,
  or LLM prompts in Earnix. Enforces strict factual grounding in verified database records, prompt
  injection mitigation, length boundaries, and human-in-the-loop review before writing to the ledger.
---

# Grounded AI & Prompt Injection Defense

This skill defines the governance and security guardrails for all AI and machine-learning capabilities in Earnix (Gemini 2.5 Flash, Copilot, and auto-categorization).
Financial software requires zero tolerance for hallucinated monetary figures.

---

## Core Invariants

1. **Deterministic Grounding in SQL Data:**
   - All financial aggregates, totals, conversion rates, and tax calculations must originate from verified database queries.
   - The LLM must never compute final financial balances or invent monetary values.
   - Grounding data must be provided as structured, verified context inside the RAG prompt in [`src/lib/ai/rag.ts`](file:///d:/Earnix/src/lib/ai/rag.ts).

2. **Prompt Boundary & Length Limits:**
   - User inputs to the Copilot must be validated and capped to a maximum character length (e.g. 500 characters in `askCopilotAction`).
   - Disallow unbounded prompt expansion to prevent token exhaustion and prompt injection.

3. **System Prompt Hardening:**
   - Instruct the model to strictly refuse answering questions outside the freelancer's accounting, tax, and ledger scope.
   - Explicitly instruct the model to report "I do not have enough verified records to answer this" rather than guessing.

4. **Human-in-the-Loop AI Review:**
   - AI categorization of imported statements or expenses is always treated as a suggestion.
   - Suggested categories must be reviewed and accepted by the user via [`AiReviewBanner`](file:///d:/Earnix/src/components/ai/ai-review-banner.tsx) and [`AiReviewModal`](file:///d:/Earnix/src/components/ai/ai-review-modal.tsx) before committing to the permanent ledger.

5. **Offline Heuristic Fallback:**
   - If the Gemini API is unavailable or unconfigured, the system must gracefully fall back to deterministic pattern-matching heuristics without failing or corrupting data.

---

## Implementation Reference in Earnix

- **Copilot Action & Length Guard:** [`src/lib/ai/copilot-action.ts`](file:///d:/Earnix/src/lib/ai/copilot-action.ts)
- **RAG & SQL Grounding Engine:** [`src/lib/ai/rag.ts`](file:///d:/Earnix/src/lib/ai/rag.ts)
- **Deterministic Heuristic Categorizer:** [`src/lib/ai/categorizer.ts`](file:///d:/Earnix/src/lib/ai/categorizer.ts)
- **AI Human Review Modal:** [`src/components/ai/ai-review-modal.tsx`](file:///d:/Earnix/src/components/ai/ai-review-modal.tsx)

---

## Verification Runbook

```bash
npm test
```

Expected assertions:
- `Heuristic classifies Next.js project as 'Software Development'`
- `Heuristic classifies Figma redesign as 'UI/UX & Product Design'`
- `Heuristic classifies AWS invoice as 'Cloud Hosting & Infrastructure'`
- `Heuristic classifies GitHub/JetBrains as 'Software & Subscriptions'`
- `Heuristic classifies Upwork fee as 'Platform & Payment Fees'`
