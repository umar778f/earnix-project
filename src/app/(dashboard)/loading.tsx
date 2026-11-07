import { PageContainer } from "@/components/layout/page-container"

export default function DashboardLoading() {
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
            <div className="h-9 w-28 bg-muted rounded-md" />
          </div>
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-border bg-card/50 p-5 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 bg-muted rounded" />
                <div className="size-4 bg-muted rounded-full" />
              </div>
              <div className="h-6 w-32 bg-muted rounded" />
            </div>
          ))}
        </div>

        {/* Main Content Area Skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="h-80 rounded-xl border border-border bg-card/50 p-5 lg:col-span-2" />
          <div className="h-80 rounded-xl border border-border bg-card/50 p-5" />
        </div>
      </div>
    </PageContainer>
  )
}
