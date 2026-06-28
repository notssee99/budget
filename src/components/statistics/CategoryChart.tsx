'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { getCategoryBreakdown, formatCurrency } from '@/lib/calculations'
import { CATEGORY_COLORS } from '@/constants'
import { useFinanceStore } from '@/store/financeStore'
import type { Expense } from '@/types'

interface CategoryChartProps {
  expenses: Expense[]
  monthId?: string
}

function CustomTooltip({ active, payload }: any) {
  const { settings } = useFinanceStore()
  if (!active || !payload?.length) return null
  const { category, amount, percentage } = payload[0].payload
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <CategoryIcon category={category} size="sm" />
        <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">{category}</span>
      </div>
      <p className="text-zinc-500">{formatCurrency(amount, settings.currencySymbol, settings.privacyMode)}</p>
      <p className="text-zinc-400 text-xs">{percentage.toFixed(1)}% of total</p>
    </div>
  )
}

const RADIAN = Math.PI / 180
function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) {
  if (percentage < 8) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${Math.round(percentage)}%`}
    </text>
  )
}

export function CategoryChart({ expenses, monthId }: CategoryChartProps) {
  const { settings } = useFinanceStore()
  const breakdown = getCategoryBreakdown(expenses, monthId)
  const top5 = breakdown.slice(0, 5)
  const total = breakdown.reduce((s, b) => s + b.amount, 0)

  if (breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
          <CardDescription>No expense data yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const pieData = breakdown.map(b => ({
    category: b.category,
    amount: b.amount,
    percentage: b.percentage,
  }))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Category Breakdown</CardTitle>
        <CardDescription>
          {formatCurrency(total, settings.currencySymbol, settings.privacyMode)} across {breakdown.length} categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                labelLine={false}
                label={CustomLabel}
              >
                {pieData.map(entry => (
                  <Cell
                    key={entry.category}
                    fill={CATEGORY_COLORS[entry.category] ?? '#6b7280'}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 bar list */}
        <div className="mt-3 space-y-2.5">
          {top5.map(b => (
            <div key={b.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <CategoryIcon category={b.category} size="sm" />
                  <span className="capitalize text-zinc-700 dark:text-zinc-300 font-medium">{b.category}</span>
                </div>
                <div className="flex items-center gap-2 tabular-nums">
                  <span className="text-zinc-400">{b.percentage.toFixed(1)}%</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(b.amount, settings.currencySymbol, settings.privacyMode)}
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${b.percentage}%`,
                    backgroundColor: CATEGORY_COLORS[b.category] ?? '#6b7280',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
