'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getMonthlyChartData, formatCurrency } from '@/lib/calculations'
import { useFinanceStore } from '@/store/financeStore'
import type { BudgetMonth, Expense } from '@/types'

interface MonthlyComparisonProps {
  months: BudgetMonth[]
  expenses: Expense[]
}

function CustomTooltip({ active, payload, label }: any) {
  const { settings } = useFinanceStore()
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-3 text-sm min-w-[160px]">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.fill }} />
          <span className="text-zinc-500 capitalize">{p.name}:</span>
          <span className="font-semibold tabular-nums text-zinc-800 dark:text-zinc-200">
            {formatCurrency(p.value, settings.currencySymbol, settings.privacyMode)}
          </span>
        </div>
      ))}
    </div>
  )
}

export function MonthlyComparison({ months, expenses }: MonthlyComparisonProps) {
  const { settings } = useFinanceStore()

  // Include current active month if present
  const allMonths = months.slice(-6) // last 6 months
  const data = getMonthlyChartData(allMonths, expenses)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Monthly Comparison</CardTitle>
          <CardDescription>No historical data yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Monthly Comparison</CardTitle>
        <CardDescription>Income vs spending over the last {data.length} months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }} barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${settings.currencySymbol}${v}`}
              />
              <ChartTooltip content={<CustomTooltip />} cursor={{ opacity: 0.05 }} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{value}</span>
                )}
              />
              <Bar dataKey="income" name="Income" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={36} />
              <Bar dataKey="spent" name="Spent" fill="#6366f1" radius={[3, 3, 0, 0]} maxBarSize={36} />
              <Bar dataKey="savings" name="Savings" fill="#0d9488" radius={[3, 3, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
