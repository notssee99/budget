'use client'

import { useState } from 'react'
import { Rocket, TrendingUp, Wallet } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AmountDisplay } from '@/components/shared/AmountDisplay'

export default function StartMonthBanner() {
  const { settings, startNewMonth } = useFinanceStore()
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl mb-6">
        💰
      </div>
      <h1 className="text-2xl font-bold mb-2">Start Your Budget Month</h1>
      <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
        Your budget month starts when you receive your salary and press the button below. All calculations will use this date.
      </p>

      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <TrendingUp size={18} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Income</p>
          <AmountDisplay amount={settings.salary} size="sm" className="font-bold" />
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Wallet size={18} className="text-amber-500 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Weekly Budget</p>
          <AmountDisplay amount={settings.weeklyBudget} size="sm" className="font-bold" />
        </div>
      </div>

      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
      >
        <Rocket size={16} />
        Start New Budget Month
      </button>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="Start New Budget Month?"
        description="This will reset your weekly/monthly budgets and start fresh from today. Previous data is archived."
        onConfirm={() => { startNewMonth(); setConfirm(false) }}
        confirmLabel="Start Month"
      />
    </div>
  )
}
