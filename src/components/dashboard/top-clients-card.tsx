import Link from "next/link"
import { formatMoney } from "@/lib/currency/format"
import { type DashboardClientItem } from "@/lib/dashboard/demo-data"
import { Users, ArrowUpRight } from "lucide-react"

interface TopClientsCardProps {
  clients: DashboardClientItem[]
  baseCurrency: string
}

export function TopClientsCard({ clients, baseCurrency }: TopClientsCardProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {clients.map((client, idx) => (
          <div
            key={client.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                {idx + 1}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {client.name}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {client.country} &bull; {client.contractCount} payments
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs font-bold text-foreground">
                {formatMoney(client.totalEarnedConverted, baseCurrency)}
              </p>
              <span className="text-[10px] text-muted-foreground font-medium">
                Lifetime Value
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 border-t border-border/40 text-center">
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Users className="size-3.5" />
          <span>Manage full client directory</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}

