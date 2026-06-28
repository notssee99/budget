'use client'

import { useState, useCallback } from 'react'
import { Pencil, Copy, Trash2, ChevronUp, ChevronDown, Minus, ReceiptText } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

import { useFinanceStore } from '@/store/financeStore'
import { formatDate } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import type { Expense } from '@/types'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExpenseTableProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
}

// ---------------------------------------------------------------------------
// Type badge
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<Expense['type'], string> = {
  expense: 'text-rose-600 dark:text-rose-400',
  income: 'text-emerald-600 dark:text-emerald-400',
  savings: 'text-indigo-500 dark:text-indigo-400',
}

const TYPE_SIGN: Record<Expense['type'], string> = {
  expense: '−',
  income: '+',
  savings: '→',
}

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------

interface RowActionsProps {
  expense: Expense
  onEdit: () => void
  onDuplicate: () => void
  onDeleteRequest: () => void
}

function RowActions({ expense: _expense, onEdit, onDuplicate, onDeleteRequest }: RowActionsProps) {
  return (
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={onEdit}
        aria-label="Edit"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
        onClick={onDuplicate}
        aria-label="Duplicate"
      >
        <Copy className="w-3.5 h-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={onDeleteRequest}
        aria-label="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mobile card row
// ---------------------------------------------------------------------------

interface MobileRowProps {
  expense: Expense
  onEdit: () => void
  onDuplicate: () => void
  onDeleteRequest: () => void
}

function MobileRow({ expense, onEdit, onDuplicate, onDeleteRequest }: MobileRowProps) {
  return (
    <div className="flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-0 group">
      <CategoryIcon category={expense.category} size="md" showBackground />

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium leading-snug truncate">{expense.description}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(expense.date)}
              {expense.notes && (
                <span className="ml-2 italic truncate max-w-[160px] inline-block align-bottom">
                  {expense.notes}
                </span>
              )}
            </p>
          </div>
          <span
            className={cn(
              'text-sm font-semibold tabular-nums whitespace-nowrap flex-shrink-0',
              TYPE_STYLES[expense.type],
            )}
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {TYPE_SIGN[expense.type]}&thinsp;
            <AmountDisplay amount={expense.amount} size="sm" />
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <CategoryBadge category={expense.category} />
          <RowActions
            expense={expense}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDeleteRequest={onDeleteRequest}
          />
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sort header cell
// ---------------------------------------------------------------------------

interface SortHeaderProps {
  label: string
  field: string
  currentField: string
  currentDir: 'asc' | 'desc'
  onSort: (field: string) => void
  className?: string
}

function SortHeader({ label, field, currentField, currentDir, onSort, className }: SortHeaderProps) {
  const active = currentField === field
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium uppercase tracking-wide transition-colors select-none',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      {label}
      <span className="w-3.5 h-3.5 flex-shrink-0">
        {active ? (
          currentDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
        ) : (
          <Minus className="w-3.5 h-3.5 opacity-30" />
        )}
      </span>
    </button>
  )
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <ReceiptText className="w-7 h-7 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">No transactions found</p>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">
        Try adjusting your filters, or add your first transaction with the button above.
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ExpenseTable({ expenses, onEdit }: ExpenseTableProps) {
  const { deleteExpense, duplicateExpense, undoDeleteExpense } = useFinanceStore()

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortField(field)
        setSortDir('desc')
      }
    },
    [sortField],
  )

  const handleDuplicate = useCallback(
    (expense: Expense) => {
      duplicateExpense(expense.id)
      toast.success('Transaction duplicated', { description: expense.description })
    },
    [duplicateExpense],
  )

  const handleDelete = useCallback(() => {
    if (!deleteTarget) return
    deleteExpense(deleteTarget.id)
    toast('Transaction deleted', {
      action: {
        label: 'Undo',
        onClick: () => undoDeleteExpense(),
      },
    })
    setDeleteTarget(null)
  }, [deleteTarget, deleteExpense, undoDeleteExpense])

  // Local sort (parent may also sort — this is for in-table sort header clicks)
  const sorted = [...expenses].sort((a, b) => {
    let cmp = 0
    if (sortField === 'date') cmp = a.date.localeCompare(b.date)
    else if (sortField === 'amount') cmp = a.amount - b.amount
    else if (sortField === 'description') cmp = a.description.localeCompare(b.description)
    return sortDir === 'asc' ? cmp : -cmp
  })

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-left w-[130px]">
                    <SortHeader
                      label="Date"
                      field="date"
                      currentField={sortField}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-2.5 text-left">
                    <SortHeader
                      label="Description"
                      field="description"
                      currentField={sortField}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="px-4 py-2.5 text-left w-[160px]">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Category
                    </span>
                  </th>
                  <th className="px-4 py-2.5 text-right w-[130px]">
                    <SortHeader
                      label="Amount"
                      field="amount"
                      currentField={sortField}
                      currentDir={sortDir}
                      onSort={handleSort}
                      className="justify-end ml-auto"
                    />
                  </th>
                  <th className="px-4 py-2.5 w-[100px]" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((expense) => (
                  <tr
                    key={expense.id}
                    className="group border-b border-border last:border-0 hover:bg-muted/40 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                      {formatDate(expense.date)}
                    </td>

                    {/* Description + notes */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <CategoryIcon category={expense.category} size="sm" showBackground />
                        <div className="min-w-0">
                          <p className="font-medium truncate leading-snug">{expense.description}</p>
                          {expense.notes && (
                            <p className="text-xs text-muted-foreground truncate max-w-[280px] mt-0.5">
                              {expense.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <CategoryBadge category={expense.category} />
                    </td>

                    {/* Amount */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'font-semibold tabular-nums',
                          TYPE_STYLES[expense.type],
                        )}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {TYPE_SIGN[expense.type]}&thinsp;
                        <AmountDisplay amount={expense.amount} size="sm" />
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <RowActions
                          expense={expense}
                          onEdit={() => onEdit(expense)}
                          onDuplicate={() => handleDuplicate(expense)}
                          onDeleteRequest={() => setDeleteTarget(expense)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden">
        {sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea className="max-h-[65vh]">
            <div>
              {sorted.map((expense) => (
                <MobileRow
                  key={expense.id}
                  expense={expense}
                  onEdit={() => onEdit(expense)}
                  onDuplicate={() => handleDuplicate(expense)}
                  onDeleteRequest={() => setDeleteTarget(expense)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete transaction"
        description={
          deleteTarget
            ? `Delete "${deleteTarget.description}"? This can be undone from the toast notification.`
            : ''
        }
        onConfirm={handleDelete}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
