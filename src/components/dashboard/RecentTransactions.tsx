'use client'

import { ArrowRight, Trash2, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { useFinanceStore } from '@/store/financeStore'
import { CATEGORY_LABELS } from '@/constants'
import { cn } from '@/lib/utils'

const TYPE_CONFIG = {
  income: {
    icon: TrendingUp,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    sign: '+',
  },
  expense: {
    icon: TrendingDown,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    sign: '-',
  },
  savings: {
    icon: PiggyBank,
    color: 'text-primary',
    bg: 'bg-primary/10',
    sign: '',
  },
}

export default function RecentTransactions() {
  const { currentMonth, expenses, deleteExpense } = useFinanceStore()

  if (!currentMonth) return null

  const recent = [...expenses]
    .filter((e) => e.budgetMonthId === currentMonth.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8)

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Recent Transactions</CardTitle>
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-muted-foreground" asChild>
            <Link href="/expenses">
              See all <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        {recent.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No transactions recorded yet this month.
          </p>
        )}
        <div className="space-y-1">
          {recent.map((tx) => {
            const cfg = TYPE_CONFIG[tx.type]
            const Icon = cfg.icon
            return (
              <div
                key={tx.id}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50"
              >
                {/* Type icon */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    cfg.bg,
                  )}
                >
                  <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                </div>

                {/* Description + meta */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[tx.category]} ·{' '}
                    {format(parseISO(tx.date), 'MMM d')}
                  </p>
                </div>

                {/* Amount */}
                <span
                  className={cn(
                    'shrink-0 text-sm font-semibold tabular-nums',
                    cfg.color,
                  )}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {cfg.sign}
                  <AmountDisplay amount={tx.amount} size="sm" />
                </span>

                {/* Delete (visible on hover) */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteExpense(tx.id)}
                  aria-label="Delete transaction"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-rose-500" />
                </Button>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
