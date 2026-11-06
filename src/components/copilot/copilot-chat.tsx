"use client"

import * as React from "react"
import { useTransition } from "react"
import Link from "next/link"
import { askCopilotAction } from "@/lib/ai/copilot-action"
import { type CopilotAnswer } from "@/lib/ai/rag"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  Send,
  Loader2,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  DollarSign,
  Receipt,
  HelpCircle,
} from "lucide-react"

interface ChatMessage {
  id: string
  sender: "user" | "copilot"
  text: string
  answerData?: CopilotAnswer
  timestamp: string
}

const SUGGESTED_PROMPTS = [
  "What was my total gross income from Upwork?",
  "What are my total business expenses and deductible costs?",
  "What is my estimated taxable net income and recommended tax reserve?",
  "How much revenue did I generate from Acme Cloud Solutions?",
]

export function CopilotChat() {
  const baseId = React.useId()
  const msgIndexRef = React.useRef(0)

  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      sender: "copilot",
      text: "Hello! I am **Earnix Copilot**, your grounded financial assistant. Ask me questions about your freelance earnings, client milestones, multi-currency conversions, or tax-deductible expenses. Every answer is deterministically verified against your immutable database ledger.",
      timestamp: "Just now",
    },
  ])

  const [inputQuery, setInputQuery] = React.useState("")
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isPending])

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim()
    if (!query || isPending) return

    msgIndexRef.current += 1
    const userMsgId = `${baseId}-user-${msgIndexRef.current}`
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: query,
      timestamp: "Just now",
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInputQuery("")

    startTransition(async () => {
      const result = await askCopilotAction(query)
      msgIndexRef.current += 1
      const copilotMsgId = `${baseId}-copilot-${msgIndexRef.current}`

      if (result.success && result.data) {
        const copilotMessage: ChatMessage = {
          id: copilotMsgId,
          sender: "copilot",
          text: result.data.answer,
          answerData: result.data,
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, copilotMessage])
      } else {
        const errorMsg: ChatMessage = {
          id: copilotMsgId,
          sender: "copilot",
          text: result.error || "I could not retrieve the financial answer at this time. Please try again.",
          timestamp: "Just now",
        }
        setMessages((prev) => [...prev, errorMsg])
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-msg",
        sender: "copilot",
        text: "Chat cleared. Ask me any question grounded in your verified freelance financial records.",
        timestamp: "Just now",
      },
    ])
  }

  return (
    <div className="flex flex-col h-[75vh] max-h-[800px] rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      {/* Zero Hallucination Trust Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-3.5" />
          </div>
          <span className="text-xs font-semibold text-foreground">
            Zero-Hallucination Financial Copilot
          </span>
          <Badge variant="outline" className="text-[10px] text-muted-foreground hidden sm:inline-flex">
            PostgreSQL &bull; Decimal.js Grounded
          </Badge>
        </div>

        <Button
          variant="ghost"
          size="xs"
          onClick={handleReset}
          className="text-xs text-muted-foreground hover:text-foreground gap-1"
          title="Reset Conversation"
        >
          <RotateCcw className="size-3" />
          <span>Clear</span>
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            {msg.sender === "user" ? (
              // User message bubble
              <div className="max-w-[85%] sm:max-w-md rounded-2xl rounded-tr-xs bg-primary px-4 py-2.5 text-xs text-primary-foreground shadow-xs">
                {msg.text}
              </div>
            ) : (
              // Copilot response card
              <div className="max-w-[95%] sm:max-w-2xl rounded-xl border border-border bg-muted/20 p-4 space-y-3 text-xs shadow-xs">
                {/* Header with Model Badge */}
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Sparkles className="size-3.5" />
                    <span>Earnix Copilot</span>
                  </div>
                  {msg.answerData?.deterministicModel && (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 text-muted-foreground font-mono">
                      {msg.answerData.deterministicModel}
                    </Badge>
                  )}
                </div>

                {/* Formatted Text */}
                <div className="text-foreground leading-relaxed whitespace-pre-line text-xs font-normal">
                  {msg.text}
                </div>

                {/* Grounded Metrics Highlight Cards */}
                {msg.answerData?.groundedMetrics && msg.answerData.groundedMetrics.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {msg.answerData.groundedMetrics.map((metric, i) => (
                      <div
                        key={i}
                        className="rounded-lg border border-border/70 bg-card p-2 text-left space-y-0.5"
                      >
                        <span className="text-[10px] text-muted-foreground truncate block">
                          {metric.label}
                        </span>
                        <span className="text-xs font-bold text-foreground font-mono">
                          {metric.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Grounded Transaction Citations */}
                {msg.answerData?.citations && msg.answerData.citations.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <HelpCircle className="size-2.5" />
                      <span>Ledger Citations &amp; Audit Trail</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.answerData.citations.map((cite) => (
                        <Link
                          key={cite.id}
                          href={cite.type === "transaction" ? "/transactions" : "/expenses"}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-[11px] text-foreground hover:border-primary/50 hover:bg-muted/40 transition-colors"
                          title={`Click to view in ${cite.type === "transaction" ? "Transactions" : "Expenses"}`}
                        >
                          {cite.type === "transaction" ? (
                            <DollarSign className="size-3 text-emerald-600 shrink-0" />
                          ) : (
                            <Receipt className="size-3 text-purple-600 shrink-0" />
                          )}
                          <span className="max-w-[140px] truncate font-medium">
                            {cite.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ({cite.date})
                          </span>
                          <ExternalLink className="size-2.5 text-muted-foreground opacity-60" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Loading Spinner */}
        {isPending && (
          <div className="flex items-start">
            <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin text-primary" />
              <span>Verifying ledger calculations and formulating grounded answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Strip (Visible on start) */}
      {messages.length <= 2 && (
        <div className="px-4 py-2 border-t border-border/60 bg-muted/10 space-y-1.5">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Suggested FYP Demo Questions:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                disabled={isPending}
                className="text-[11px] rounded-md border border-border bg-background px-2.5 py-1 text-foreground hover:border-primary/40 hover:bg-muted/30 transition-colors text-left cursor-pointer"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box Footer */}
      <div className="border-t border-border bg-background p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Copilot about earnings, expenses, platforms, clients, or tax estimates..."
              disabled={isPending}
              className="h-10 text-xs pr-10"
            />
          </div>

          <Button
            type="submit"
            size="sm"
            disabled={isPending || !inputQuery.trim()}
            className="h-10 px-3.5 gap-1.5 shrink-0"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            <span className="hidden sm:inline">Ask Copilot</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
