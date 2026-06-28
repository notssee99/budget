'use client'

import { Receipt, Check, Clock, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { useFinanceStore } from '@/store/financeStore'
import { cn } from '@/lib/utils'
import type { FixedExpense } from '@/types'
import { formatCurrency } from '@/lib/calculations'

interface FixedExpensesCardProps {
  totalFixed: number
}

function getExpenseStatus(fe: FixedExpense): 'paid' | 'pending' | 'overdue' {
  if (fe.isPaid) return 'paid'
  const today = new Date()
  const dueDay = fe.dueDay
  if (today.getDate() > dueDay) return 'overdue'
  return 'pending'
}

const STATUS_CONFIG = {
  paid: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    icon: <Check className="h-3 w-3" />,
    label: 'Paid',
  },
  pending: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    icon: <Clock className="h-3 w-3" />,
    label: 'Pending',
  },
  overdue: {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Overdue',
  },
}

export default function FixedExpensesCard({ totalFixed }: FixedExpensesCardProps) {
  const { fixedExpenses, markFixedExpensePaid, unmarkFixedExpensePaid, settings } = useFinanceStore()
  const paidCount = fixedExpenses.filter((fe) => fe.isPaid).length

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
              <Receipt className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            Fixed Expenses
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {paidCount}/{fixedExpenses.length} paid
            </span>
            <Badge variant="outline" className="font-mono text-xs">
              <AmountDisplay amount={totalFixed} size="sm" />
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="space-y-1.5">
          {fixedExpenses.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">No fixed expenses set up.</p>
          )}
          {fixedExpenses.map((fe) => {
            const status = getExpenseStatus(fe)
            const cfg = STATUS_CONFIG[status]
            return (
              <div
                key={fe.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors',
                  fe.isPaid ? 'bg-muted/30' : 'bg-muted/50 hover:bg-muted',
                )}
              >
                {/* Status dot */}
                <div
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    status === 'paid'
                      ? 'bg-emerald-500'
                      : status === 'overdue'
                        ? 'bg-rose-500'
                        : 'bg-amber-500',
                  )}
                />

                {/* Name */}
                <span
                  className={cn(
                    'flex-1 truncate text-sm',
                    fe.isPaid ? 'text-muted-foreground line-through' : 'text-foreground',
                  )}
                >
                  {fe.name}
                </span>

                {/* Amount */}
                <AmountDisplay
                  amount={fe.amount}
                  size="sm"
                  className={cn('font-semibold', fe.isPaid ? 'text-muted-foreground' : 'text-foreground')}
                />

                {/* Status badge */}
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
                    cfg.badge,
                  )}
                >
                  {cfg.icon}
                  {cfg.label}
                </span>

                {/* Action */}
                {fe.isPaid ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => unmarkFixedExpensePaid(fe.id)}
                  >
                    Undo
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => markFixedExpensePaid(fe.id)}
                  >
                    Mark paid
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
