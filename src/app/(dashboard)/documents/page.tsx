import { Metadata } from "next"
import { PageContainer } from "@/components/layout/page-container"
import { PageHeader } from "@/components/layout/page-header"
import { DocumentVaultView } from "@/components/documents/document-vault-view"
import { getDocumentsSummary } from "@/lib/documents/service"

export const metadata: Metadata = {
  title: "Document Vault | Earnix",
  description:
    "Secure document vault for invoices, receipts, payment proofs, and tax filing certificates backed by Supabase Storage.",
}

export default async function DocumentsPage() {
  const summary = await getDocumentsSummary()

  return (
    <PageContainer>
      <PageHeader
        title="Document Vault"
        description="Encrypted repository for invoices, payment receipts, platform statements, and tax-ready substantiation."
      />

      <DocumentVaultView summary={summary} />
    </PageContainer>
  )
}
