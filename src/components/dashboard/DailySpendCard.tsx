'use client'

import { Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import type { DashboardStats } from '@/types'

export default function DailySpendCard({ stats }: { stats: DashboardStats }) {
  const { settings } = useFinanceStore()
  const { dailySafeSpend, daysUntilSalary } = stats
  const fmt = (n: number) => settings.privacyMode ? '••••' : formatCurrency(n, settings.currencySymbol)

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900/30">
          <Sun size={15} className="text-sky-600 dark:text-sky-400" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Safe Today</span>
      </div>
      <div>
        <p className={cn('text-2xl font-bold tabular-nums', dailySafeSpend < 0 ? 'text-destructive' : 'text-foreground')}>
          {fmt(Math.max(0, dailySafeSpend))}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {daysUntilSalary > 0 ? `${daysUntilSalary} days until next salary` : 'Salary day!'}
        </p>
      </div>
    </div>
  )
}
