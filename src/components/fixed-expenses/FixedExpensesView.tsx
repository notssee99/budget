'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useFinanceStore } from '@/store/financeStore'
import { useAuthStore } from '@/store/authStore'
import { DEFAULT_FIXED_EXPENSES } from '@/constants'
import { formatCurrency } from '@/lib/calculations'
import { FixedExpenseForm } from './FixedExpenseForm'
import type { FixedExpense } from '@/types'

function FeRow({
  fe,
  onEdit,
  onDelete,
  onTogglePaid,
}: {
  fe: FixedExpense
  onEdit: (fe: FixedExpense) => void
  onDelete: (id: string) => void
  onTogglePaid: (id: string, paid: boolean) => void
}) {
  const { settings } = useFinanceStore()

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <button
        onClick={() => onTogglePaid(fe.id, !fe.isPaid)}
        className="shrink-0 text-muted-foreground hover:text-primary transition-colors"
      >
        {fe.isPaid
          ? <CheckCircle2 size={20} className="text-green-500" />
          : <Circle size={20} />
        }
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${fe.isPaid ? 'line-through text-muted-foreground' : ''}`}>
          {fe.name}
        </p>
        <p className="text-xs text-muted-foreground">Dita {fe.dueDay} · {fe.category}</p>
      </div>

      <span className="text-sm font-semibold tabular-nums shrink-0">
        {formatCurrency(fe.amount, settings.currencySymbol)}
      </span>

      <div className="flex gap-1 shrink-0">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(fe)}>
          <Pencil size={13} />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(fe.id)}>
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  )
}

export function FixedExpensesView() {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense, markFixedExpensePaid, unmarkFixedExpensePaid, currentMonth, settings } = useFinanceStore()
  const { user } = useAuthStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<FixedExpense | null>(null)

  const realMine = fixedExpenses.filter(fe => !fe.assignedTo || fe.assignedTo === 'festoni')
  const odetas = fixedExpenses.filter(fe => fe.assignedTo === 'odeta')

  // Show defaults for Festoni when no real data exists yet
  const defaultsAsFixed: FixedExpense[] = DEFAULT_FIXED_EXPENSES
    .filter(fe => fe.assignedTo === 'festoni' || !fe.assignedTo)
    .map((fe, i) => ({
      ...fe,
      id: `default-${i}`,
      budgetMonthId: currentMonth?.id ?? '',
      isPaid: false,
      assignedTo: 'festoni' as const,
    }))
  const mine = realMine.length > 0 ? realMine : (user?.id === 'festoni' ? defaultsAsFixed : [])

  const isDefault = (id: string) => id.startsWith('default-')

  function ensureSaved(fe: FixedExpense) {
    if (isDefault(fe.id)) {
      // Save the default to Supabase first
      addFixedExpense({ name: fe.name, amount: fe.amount, dueDay: fe.dueDay, category: fe.category, assignedTo: fe.assignedTo })
    }
  }

  const totalMine = mine.reduce((s, fe) => s + fe.amount, 0)
  const totalOdeta = odetas.reduce((s, fe) => s + fe.amount, 0)
  const totalAll = totalMine + totalOdeta

  function handleEdit(fe: FixedExpense) {
    if (isDefault(fe.id)) {
      // For defaults, open form pre-filled so user can save it properly
      setEditing({ ...fe, id: '' })
    } else {
      setEditing(fe)
    }
    setFormOpen(true)
  }

  function handleDelete(id: string) {
    if (isDefault(id)) return
    if (confirm('Fshi shpenzimin?')) deleteFixedExpense(id)
  }

  function handleTogglePaid(id: string, paid: boolean) {
    if (isDefault(id)) {
      const fe = mine.find(f => f.id === id)
      if (fe && paid) {
        addFixedExpense({ name: fe.name, amount: fe.amount, dueDay: fe.dueDay, category: fe.category, assignedTo: fe.assignedTo })
      }
      return
    }
    if (paid) markFixedExpensePaid(id)
    else unmarkFixedExpensePaid(id)
  }

  function handleSave(data: Omit<FixedExpense, 'id' | 'budgetMonthId' | 'isPaid' | 'paidDate'>) {
    if (editing && editing.id) {
      updateFixedExpense(editing.id, data)
    } else {
      addFixedExpense(data)
    }
    setEditing(null)
  }

  function openAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shpenzimet Fikse</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gjithsej: {formatCurrency(totalAll, settings.currencySymbol)} / muaj
          </p>
        </div>
        <Button onClick={openAdd} size="sm" className="gap-2">
          <Plus size={15} />
          Shto
        </Button>
      </div>

      {/* Festoni's section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            👨 Të Miat
            <Badge variant="secondary" className="text-xs">
              {formatCurrency(totalMine, settings.currencySymbol)}
            </Badge>
          </h2>
        </div>
        {mine.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nuk ka shpenzime fikse</p>
        ) : (
          <div className="space-y-2">
            {mine.sort((a, b) => a.dueDay - b.dueDay).map(fe => (
              <FeRow
                key={fe.id}
                fe={fe}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePaid={handleTogglePaid}
              />
            ))}
          </div>
        )}
      </section>

      {/* Odeta's section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2">
            👩 Të Odetës
            <Badge variant="secondary" className="text-xs">
              {formatCurrency(totalOdeta, settings.currencySymbol)}
            </Badge>
          </h2>
        </div>
        {odetas.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Nuk ka shpenzime fikse</p>
        ) : (
          <div className="space-y-2">
            {odetas.sort((a, b) => a.dueDay - b.dueDay).map(fe => (
              <FeRow
                key={fe.id}
                fe={fe}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTogglePaid={handleTogglePaid}
              />
            ))}
          </div>
        )}
      </section>

      <FixedExpenseForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
        showAssign
      />
    </div>
  )
}
