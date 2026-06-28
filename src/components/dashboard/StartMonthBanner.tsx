'use client'

import { useState } from 'react'
import { Rocket, TrendingUp, Wallet, ChevronDown } from 'lucide-react'
import { format, addMonths, startOfMonth } from 'date-fns'
import { useFinanceStore } from '@/store/financeStore'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { AmountDisplay } from '@/components/shared/AmountDisplay'

function getMonthOptions() {
  const now = new Date()
  const thisMonth = startOfMonth(now)
  const nextMonth = startOfMonth(addMonths(now, 1))
  return [
    { label: format(thisMonth, 'MMMM yyyy'), value: format(thisMonth, 'yyyy-MM-dd') },
    { label: format(nextMonth, 'MMMM yyyy'), value: format(nextMonth, 'yyyy-MM-dd') },
  ]
}

export default function StartMonthBanner() {
  const { settings, startNewMonth } = useFinanceStore()
  const [confirm, setConfirm] = useState(false)
  const options = getMonthOptions()
  const [selected, setSelected] = useState(options[0].value)

  const selectedLabel = options.find(o => o.value === selected)?.label ?? ''

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-lg mx-auto">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl mb-6">
        💰
      </div>
      <h1 className="text-2xl font-bold mb-1">Fillo Muajin e Buxhetit</h1>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        Zgjidh muajin dhe shtyp butonin kur të marrësh pagën. Të gjitha llogaritjet do fillojnë nga kjo datë.
      </p>

      {/* Month picker */}
      <div className="relative mb-6 w-full max-w-xs">
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block text-left">Muaji</label>
        <div className="relative">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {options.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <TrendingUp size={18} className="text-emerald-500 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Rroga</p>
          <AmountDisplay amount={settings.salary} size="sm" className="font-bold" />
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <Wallet size={18} className="text-amber-500 mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Buxheti javor</p>
          <AmountDisplay amount={settings.weeklyBudget} size="sm" className="font-bold" />
        </div>
      </div>

      <button
        onClick={() => setConfirm(true)}
        className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
      >
        <Rocket size={16} />
        Fillo {selectedLabel}
      </button>

      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title={`Fillo ${selectedLabel}?`}
        description={`Do të fillojë muaji i ri nga ${selectedLabel}. Të dhënat e muajit të kaluar arkivohen.`}
        onConfirm={() => { startNewMonth(selected); setConfirm(false) }}
        confirmLabel="Fillo Muajin"
      />
    </div>
  )
}
