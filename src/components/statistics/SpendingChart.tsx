'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useFinanceStore } from '@/store/financeStore'
import { getAllWeekSummaries, formatCurrency } from '@/lib/calculations'
import type { Expense, BudgetMonth } from '@/types'

interface SpendingChartProps {
  expenses: Expense[]
  currentMonth: BudgetMonth | null
}

function CustomTooltip({ active, payload, label }: any) {
  const { settings } = useFinanceStore()
  if (!active || !payload?.length) return null
  const spent = payload.find((p: any) => p.dataKey === 'spent')?.value ?? 0
  const budget = payload.find((p: any) => p.dataKey === 'budget')?.value ?? 0
  const over = spent > budget
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
          <span className="text-zinc-500">Spent:</span>
          <span className={`font-semibold tabular-nums ${over ? 'text-red-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
            {formatCurrency(spent, settings.currencySymbol, settings.privacyMode)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-zinc-300 flex-shrink-0" />
          <span className="text-zinc-500">Budget:</span>
          <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
            {formatCurrency(budget, settings.currencySymbol, settings.privacyMode)}
          </span>
        </div>
        {over && (
          <p className="text-xs text-red-500 font-medium mt-1">
            {formatCurrency(spent - budget, settings.currencySymbol, settings.privacyMode)} over budget
          </p>
        )}
      </div>
    </div>
  )
}

export function SpendingChart({ expenses, currentMonth }: SpendingChartProps) {
  const { settings } = useFinanceStore()

  if (!currentMonth) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Spending</CardTitle>
          <CardDescription>No active budget month</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const weeks = getAllWeekSummaries(currentMonth, expenses)
  const data = weeks.map(w => ({
    name: `Wk ${w.weekNumber}`,
    spent: Math.round(w.spent * 100) / 100,
    budget: Math.round(w.budget * 100) / 100,
    remaining: Math.max(0, Math.round(w.remaining * 100) / 100),
  }))

  const maxBudget = Math.max(...data.map(d => d.budget), currentMonth.weeklyBudget)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Weekly Spending</CardTitle>
        <CardDescription>Spend vs weekly budget for this budget month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="budgetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.06} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.5 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${settings.currencySymbol}${v}`}
                domain={[0, Math.ceil(maxBudget * 1.2)]}
              />
              <ChartTooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={currentMonth.weeklyBudget}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                strokeOpacity={0.6}
                label={{ value: 'Base budget', position: 'insideTopRight', fontSize: 10, fill: '#f59e0b', opacity: 0.8 }}
              />
              <Area
                type="monotone"
                dataKey="budget"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="url(#budgetGradient)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#spentGradient)"
                dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
