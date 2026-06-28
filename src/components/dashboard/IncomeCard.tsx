'use client'

import { useState } from 'react'
import { Pencil, Check, X, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import { toast } from 'sonner'

export default function IncomeCard() {
  const { currentMonth, settings, updateCurrentMonthIncome } = useFinanceStore()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')

  const income = currentMonth?.income ?? settings.salary

  const startEdit = () => {
    setValue(String(income))
    setEditing(true)
  }

  const save = () => {
    const num = parseFloat(value)
    if (isNaN(num) || num < 0) {
      toast.error('Enter a valid amount')
      return
    }
    updateCurrentMonthIncome(num)
    setEditing(false)
    toast.success('Monthly income updated')
  }

  const cancel = () => setEditing(false)

  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <TrendingUp size={15} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Monthly Income</span>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Edit income"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              {settings.currencySymbol}
            </span>
            <input
              autoFocus
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
              className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
              min="0"
              step="1"
            />
          </div>
          <button onClick={save} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Check size={14} />
          </button>
          <button onClick={cancel} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div>
          <p className={cn('text-2xl font-bold tabular-nums', settings.privacyMode && 'blur-sm select-none')}>
            {settings.privacyMode ? '••••••' : formatCurrency(income, settings.currencySymbol)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Tap ✏️ to edit this month&apos;s income</p>
        </div>
      )}
    </div>
  )
}
