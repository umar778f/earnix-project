import { PageContainer } from "@/components/layout/page-container"

export default function GenericDashboardLoading() {
  return (
    <PageContainer>
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border/60">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-muted rounded-md" />
            <div className="h-4 w-72 bg-muted/60 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-muted rounded-md" />
          </div>
        </div>

        {/* Content Area Skeleton */}
        <div className="h-96 rounded-xl border border-border bg-card/50 p-6 space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="space-y-3 pt-4">
            <div className="h-10 w-full bg-muted/40 rounded" />
            <div className="h-10 w-full bg-muted/40 rounded" />
            <div className="h-10 w-full bg-muted/40 rounded" />
            <div className="h-10 w-full bg-muted/40 rounded" />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
