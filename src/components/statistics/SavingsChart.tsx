'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import type { Expense, BudgetMonth } from '@/types'
import { format, parseISO } from 'date-fns'

interface SavingsChartProps {
  expenses: Expense[]
  months: BudgetMonth[]
  currentMonth: BudgetMonth | null
}

export function SavingsChart({ expenses, months, currentMonth }: SavingsChartProps) {
  const allMonths = currentMonth
    ? [...months.filter(m => m.id !== currentMonth.id), currentMonth]
    : months

  const data = allMonths
    .sort((a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime())
    .slice(-6)
    .map(month => {
      const saved = expenses
        .filter(e => e.budgetMonthId === month.id && e.type === 'savings')
        .reduce((s, e) => s + e.amount, 0)
      return {
        label: format(parseISO(month.startDate), 'MMM yy'),
        amount: saved,
      }
    })

  const max = Math.max(...data.map(d => d.amount), 1)
  const total = data.reduce((s, d) => s + d.amount, 0)

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Savings History</CardTitle>
          <CardDescription>No savings recorded yet</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Savings History</CardTitle>
        <CardDescription>
          Total: <AmountDisplay amount={total} size="sm" /> across {data.filter(d => d.amount > 0).length} months
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((d, i) => (
          <div key={d.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-600 dark:text-zinc-400 font-medium">{d.label}</span>
              <AmountDisplay amount={d.amount} size="sm" className="font-semibold" />
            </div>
            <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${max > 0 ? (d.amount / max) * 100 : 0}%` }}
                transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.06 }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
