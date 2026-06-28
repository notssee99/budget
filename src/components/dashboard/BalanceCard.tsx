'use client'

import { Wallet } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import type { DashboardStats } from '@/types'

export default function BalanceCard({ stats }: { stats: DashboardStats }) {
  const { settings } = useFinanceStore()
  const { currentBalance, availableToSpend } = stats
  const pct = availableToSpend > 0 ? Math.min(100, (currentBalance / availableToSpend) * 100) : 0

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <Wallet size={15} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Balance</span>
      </div>
      <div>
        <p className={cn('text-2xl font-bold tabular-nums', currentBalance < 0 ? 'text-destructive' : 'text-foreground', settings.privacyMode && 'blur-sm select-none')}>
          {settings.privacyMode ? '••••••' : formatCurrency(currentBalance, settings.currencySymbol)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          of {settings.privacyMode ? '••••' : formatCurrency(availableToSpend, settings.currencySymbol)} available
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', pct > 100 ? 'bg-destructive' : pct > 75 ? 'bg-primary' : 'bg-emerald-500')}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  )
}
