'use client'

import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import type { DashboardStats } from '@/types'

export default function WeeklyBudgetCard({ stats }: { stats: DashboardStats }) {
  const { settings } = useFinanceStore()
  const { weeklyBudget, weeklySpent, weeklyRemaining, weeklyPercentUsed, weeklyRollover } = stats

  const color = weeklyPercentUsed >= 100 ? 'bg-destructive' : weeklyPercentUsed >= 90 ? 'bg-orange-500' : weeklyPercentUsed >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
  const textColor = weeklyPercentUsed >= 100 ? 'text-destructive' : 'text-foreground'
  const fmt = (n: number) => settings.privacyMode ? '••••' : formatCurrency(n, settings.currencySymbol)

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <CalendarDays size={15} className="text-amber-600 dark:text-amber-400" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Weekly Budget</span>
      </div>
      <div>
        <p className={cn('text-2xl font-bold tabular-nums', textColor)}>
          {fmt(weeklyRemaining)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {fmt(weeklySpent)} of {fmt(weeklyBudget)} used
          {weeklyRollover > 0 && <span className="text-emerald-600 dark:text-emerald-400 ml-1">(+{fmt(weeklyRollover)} rollover)</span>}
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color)} style={{ width: `${Math.min(100, weeklyPercentUsed)}%` }} />
      </div>
      {weeklyPercentUsed >= 80 && (
        <p className={cn('text-xs font-medium', weeklyPercentUsed >= 100 ? 'text-destructive' : 'text-amber-600 dark:text-amber-400')}>
          {weeklyPercentUsed >= 100 ? `Over budget by ${fmt(Math.abs(weeklyRemaining))}` : `${Math.round(weeklyPercentUsed)}% of weekly budget used`}
        </p>
      )}
    </div>
  )
}
