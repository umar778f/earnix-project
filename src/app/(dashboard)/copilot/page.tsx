import { Metadata } from "next"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { CopilotChat } from "@/components/copilot/copilot-chat"

export const metadata: Metadata = {
  title: "AI Financial Copilot | Earnix",
  description:
    "Ask natural-language financial questions strictly grounded in your verified database ledger with zero hallucinations.",
}

export default function CopilotPage() {
  return (
    <PageContainer maxWidth="narrow">
      <PageHeader
        title="Earnix AI Copilot"
        description="Grounded financial assistant formulating natural-language explanations strictly from verified database records."
      />

      <CopilotChat />
    </PageContainer>
  )
}
