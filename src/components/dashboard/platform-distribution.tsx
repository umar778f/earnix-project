import { formatMoney } from "@/lib/currency/format"
import { type PlatformDistributionItem } from "@/lib/dashboard/demo-data"
import { Briefcase, FileSpreadsheet, PenTool, Layers } from "lucide-react"

interface PlatformDistributionProps {
  distribution: PlatformDistributionItem[]
  baseCurrency: string
}

export function PlatformDistribution({ distribution, baseCurrency }: PlatformDistributionProps) {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="py-6 text-center text-xs text-muted-foreground">
        No platform earnings recorded yet. Ingest statements or record a payment to see platform breakdown.
      </div>
    )
  }

  const getIcon = (code: string) => {
    switch (code) {
      case "upwork":
        return Briefcase
      case "generic_csv":
        return FileSpreadsheet
      case "manual":
        return PenTool
      default:
        return Layers
    }
  }

  return (
    <div className="space-y-4">
      {distribution.map((item, idx) => {
        const Icon = getIcon(item.code)
        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-foreground">
                <Icon className="size-3.5 text-muted-foreground" />
                <span>{item.platform}</span>
              </span>
              <span className="font-semibold text-foreground">
                {formatMoney(item.total, baseCurrency)}{" "}
                <span className="text-[11px] font-normal text-muted-foreground">
                  ({item.percentage}%)
                </span>
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.min(item.percentage, 100)}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

