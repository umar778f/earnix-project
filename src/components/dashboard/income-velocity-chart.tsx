"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import { type MonthlyTrendItem } from "@/lib/dashboard/demo-data"
import { formatMoney } from "@/lib/currency/format"

interface IncomeVelocityChartProps {
  data: MonthlyTrendItem[]
  baseCurrency: string
}

const emptySubscribe = () => () => {}

interface CustomTooltipPayloadItem {
  name?: string
  value?: number
  color?: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: CustomTooltipPayloadItem[]
  label?: string
  baseCurrency?: string
}

// Custom tooltip for financial precision and styling
function CustomTooltip({ active, payload, label, baseCurrency = "USD" }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-popover p-3 shadow-md text-xs space-y-1.5">
        <p className="font-semibold text-popover-foreground">{label} Performance</p>
        {payload.map((item, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}:
            </span>
            <span className="font-semibold text-foreground">
              {formatMoney(item.value || 0, baseCurrency)}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export function IncomeVelocityChart({ data, baseCurrency }: IncomeVelocityChartProps) {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  if (!isMounted) {
    return (
      <div className="h-72 w-full rounded-lg border border-border/40 bg-muted/10 animate-pulse flex items-center justify-center text-xs text-muted-foreground">
        Loading analytics visualization...
      </div>
    )
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-border/60" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="currentColor"
            className="text-muted-foreground text-[11px]"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="currentColor"
            className="text-muted-foreground text-[11px]"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip baseCurrency={baseCurrency} />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: "12px", fontSize: "12px" }}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Gross Income"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#incomeGradient)"
          />
          <Area
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#f59e0b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#expenseGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
