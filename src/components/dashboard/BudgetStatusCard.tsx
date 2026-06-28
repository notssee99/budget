'use client'

import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import type { DashboardStats } from '@/types'

const STATUS = {
  excellent: { label: 'Excellent', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30', dot: 'bg-emerald-500', msg: "You're well within budget. Keep it up!" },
  good:      { label: 'Good',      color: 'text-sky-600 dark:text-sky-400',         bg: 'bg-sky-100 dark:bg-sky-900/30',         dot: 'bg-sky-500',     msg: 'On track. Stay focused.' },
  warning:   { label: 'Warning',   color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-100 dark:bg-amber-900/30',     dot: 'bg-amber-500',   msg: 'Spending is climbing. Slow down.' },
  danger:    { label: 'Danger',    color: 'text-orange-600 dark:text-orange-400',   bg: 'bg-orange-100 dark:bg-orange-900/30',   dot: 'bg-orange-500',  msg: 'Almost at your limit!' },
  over:      { label: 'Over Budget', color: 'text-destructive',                     bg: 'bg-destructive/10',                     dot: 'bg-destructive', msg: "You've exceeded your budget this month." },
}

export default function BudgetStatusCard({ stats }: { stats: DashboardStats }) {
  const { settings } = useFinanceStore()
  const { budgetStatus, monthlySpent, monthlyRemaining, spendingStreak } = stats
  const s = STATUS[budgetStatus]
  const fmt = (n: number) => settings.privacyMode ? '••••' : formatCurrency(n, settings.currencySymbol)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Budget Status</p>
          <div className="flex items-center gap-2">
            <span className={cn('inline-block h-2.5 w-2.5 rounded-full', s.dot)} />
            <span className={cn('text-lg font-bold', s.color)}>{s.label}</span>
          </div>
        </div>
        {spendingStreak > 0 && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">🔥 {spendingStreak} days</p>
          </div>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-4">{s.msg}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className={cn('rounded-lg p-3', s.bg)}>
          <p className="text-xs text-muted-foreground">Spent</p>
          <p className={cn('text-base font-bold', s.color)}>{fmt(monthlySpent)}</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Remaining</p>
          <p className={cn('text-base font-bold', monthlyRemaining < 0 ? 'text-destructive' : 'text-foreground')}>{fmt(monthlyRemaining)}</p>
        </div>
      </div>
    </div>
  )
}
