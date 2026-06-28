'use client'

import { useState, useMemo, useCallback } from 'react'
import { Plus, Download, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO, isWithinInterval, startOfDay } from 'date-fns'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AmountDisplay } from '@/components/shared/AmountDisplay'

import { useFinanceStore } from '@/store/financeStore'
import { cn } from '@/lib/utils'
import type { Expense } from '@/types'

import { ExpenseForm } from './ExpenseForm'
import { ExpenseFilters, type ExpenseFilters as FilterState } from './ExpenseFilters'
import { ExpenseTable } from './ExpenseTable'

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string
  amount: number
  icon: React.ReactNode
  colorClass: string
  sign?: string
}

function StatCard({ label, amount, icon, colorClass, sign }: StatCardProps) {
  return (
    <Card className="flex items-center gap-3.5 px-5 py-4 border-border">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', colorClass)}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        <p className={cn('text-lg font-semibold tabular-nums leading-tight mt-0.5', colorClass.replace(/bg-\S+/, '').trim())}>
          {sign && <span className="mr-0.5">{sign}</span>}
          <AmountDisplay amount={amount} size="md" />
        </p>
      </div>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

function exportToCSV(expenses: Expense[]) {
  const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes']
  const rows = expenses.map((e) => [
    e.date,
    `"${e.description.replace(/"/g, '""')}"`,
    e.category,
    e.type,
    e.amount.toFixed(2),
    e.notes ? `"${e.notes.replace(/"/g, '""')}"` : '',
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ---------------------------------------------------------------------------
// Filter + sort logic
// ---------------------------------------------------------------------------

function applyFilters(expenses: Expense[], filters: FilterState): Expense[] {
  let result = [...expenses]

  // Search
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        (e.notes ?? '').toLowerCase().includes(q),
    )
  }

  // Type
  if (filters.type !== 'all') {
    result = result.filter((e) => e.type === filters.type)
  }

  // Categories
  if (filters.categories.length > 0) {
    result = result.filter((e) => filters.categories.includes(e.category))
  }

  // Date range
  if (filters.dateFrom) {
    const from = startOfDay(parseISO(filters.dateFrom))
    result = result.filter((e) => startOfDay(parseISO(e.date)) >= from)
  }
  if (filters.dateTo) {
    const to = startOfDay(parseISO(filters.dateTo))
    result = result.filter((e) => startOfDay(parseISO(e.date)) <= to)
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0
    if (filters.sortBy === 'date') cmp = a.date.localeCompare(b.date)
    else if (filters.sortBy === 'amount') cmp = a.amount - b.amount
    else if (filters.sortBy === 'description') cmp = a.description.localeCompare(b.description)
    return filters.sortDir === 'asc' ? cmp : -cmp
  })

  return result
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExpensesView() {
  const { expenses, currentMonth } = useFinanceStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    type: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortDir: 'desc',
  })

  // Summary stats for the current month
  const monthExpenses = useMemo(() => {
    if (!currentMonth) return expenses
    return expenses.filter((e) => e.budgetMonthId === currentMonth.id)
  }, [expenses, currentMonth])

  const totalSpent = useMemo(
    () => monthExpenses.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  )
  const totalIncome = useMemo(
    () => monthExpenses.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  )
  const totalSavings = useMemo(
    () => monthExpenses.filter((e) => e.type === 'savings').reduce((s, e) => s + e.amount, 0),
    [monthExpenses],
  )

  // Filtered data (all expenses, not just current month)
  const filtered = useMemo(() => applyFilters(expenses, filters), [expenses, filters])

  const handleEdit = useCallback((expense: Expense) => {
    setEditingExpense(expense)
    setFormOpen(true)
  }, [])

  const handleAdd = useCallback(() => {
    setEditingExpense(undefined)
    setFormOpen(true)
  }, [])

  const handleFormClose = useCallback((open: boolean) => {
    setFormOpen(open)
    if (!open) setEditingExpense(undefined)
  }, [])

  const handleExport = useCallback(() => {
    exportToCSV(filtered)
    toast.success(`Exported ${filtered.length} transaction${filtered.length !== 1 ? 's' : ''}`)
  }, [filtered])

  return (
    <div className="flex flex-col gap-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {currentMonth
              ? `Current month · ${expenses.filter((e) => e.budgetMonthId === currentMonth.id).length} entries`
              : `${expenses.length} total entries`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="hidden sm:flex gap-1.5 h-9"
            disabled={filtered.length === 0}
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
          <Button onClick={handleAdd} size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add transaction</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Spent this month"
          amount={totalSpent}
          icon={<TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
          colorClass="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
          sign="−"
        />
        <StatCard
          label="Income this month"
          amount={totalIncome}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          colorClass="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
          sign="+"
        />
        <StatCard
          label="Saved this month"
          amount={totalSavings}
          icon={<PiggyBank className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />}
          colorClass="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
          sign="→"
        />
      </div>

      {/* Filters + table */}
      <Card className="overflow-hidden border-border">
        {/* Filters */}
        <div className="px-5 py-4 border-b border-border">
          <ExpenseFilters onFiltersChange={setFilters} />
        </div>

        {/* Result count */}
        {filtered.length !== expenses.length && (
          <div className="px-5 py-2 bg-muted/40 border-b border-border">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filtered.length}</span> of{' '}
              <span className="font-medium text-foreground">{expenses.length}</span> transactions
            </p>
          </div>
        )}

        {/* Table */}
        <ExpenseTable expenses={filtered} onEdit={handleEdit} />
      </Card>

      {/* Mobile floating add button */}
      <button
        type="button"
        onClick={handleAdd}
        className={cn(
          'md:hidden fixed bottom-20 right-4 z-30',
          'w-14 h-14 rounded-full shadow-lg',
          'bg-primary text-primary-foreground',
          'flex items-center justify-center',
          'transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        )}
        aria-label="Add transaction"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Form dialog */}
      <ExpenseForm
        open={formOpen}
        onOpenChange={handleFormClose}
        expense={editingExpense}
      />
    </div>
  )
}
