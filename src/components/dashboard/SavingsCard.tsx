'use client'

import { PiggyBank } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import type { DashboardStats } from '@/types'

export default function SavingsCard({ stats }: { stats: DashboardStats }) {
  const { settings } = useFinanceStore()
  const { currentSavings } = stats
  const fmt = (n: number) => settings.privacyMode ? '••••' : formatCurrency(n, settings.currencySymbol)

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <PiggyBank size={15} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <span className="text-sm font-medium text-muted-foreground">Saved This Month</span>
      </div>
      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
        {fmt(currentSavings)}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {currentSavings > 0 ? 'Kursime të regjistruara si shpenzime' : 'Nuk ka kursime këtë muaj'}
      </p>
    </div>
  )
}
