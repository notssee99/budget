'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  parseISO,
  isWithinInterval,
} from 'date-fns'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { CategoryIcon } from '@/components/shared/CategoryIcon'
import { useFinanceStore } from '@/store/financeStore'
import { CATEGORY_COLORS } from '@/constants'
import { formatCurrency } from '@/lib/calculations'
import type { Expense } from '@/types'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function buildCalendarGrid(viewDate: Date): Date[] {
  const start = startOfWeek(startOfMonth(viewDate))
  const end = endOfWeek(endOfMonth(viewDate))
  const days: Date[] = []
  let d = start
  while (d <= end) {
    days.push(d)
    d = addDays(d, 1)
  }
  return days
}

function groupExpensesByDay(expenses: Expense[]): Record<string, Expense[]> {
  const result: Record<string, Expense[]> = {}
  for (const e of expenses) {
    const key = e.date.slice(0, 10)
    if (!result[key]) result[key] = []
    result[key].push(e)
  }
  return result
}

export function BudgetCalendar() {
  const { expenses, currentMonth, settings } = useFinanceStore()
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const today = new Date()

  const days = useMemo(() => buildCalendarGrid(viewDate), [viewDate])

  // Filter expenses relevant to the viewed month's budget month
  const byDay = useMemo(() => groupExpensesByDay(expenses), [expenses])

  // Calculate daily budget for color coding
  const dailyBudget = currentMonth
    ? (currentMonth.weeklyBudget * 52) / 365
    : 0

  const selectedDayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null
  const selectedDayExpenses = selectedDayKey ? (byDay[selectedDayKey] ?? []) : []

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {format(viewDate, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewDate(prev => subMonths(prev, 1))}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs"
            onClick={() => setViewDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setViewDate(prev => addMonths(prev, 1))}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <Card className="border-zinc-200/60 dark:border-zinc-800/60 overflow-hidden">
        <CardContent className="p-0">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-zinc-800">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              const key = format(day, 'yyyy-MM-dd')
              const dayExpenses = byDay[key] ?? []
              const onlyExpenses = dayExpenses.filter(e => e.type === 'expense')
              const hasIncome = dayExpenses.some(e => e.type === 'income')
              const dayTotal = onlyExpenses.reduce((s, e) => s + e.amount, 0)
              const isCurrentMonth = isSameMonth(day, viewDate)
              const isToday = isSameDay(day, today)
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false
              const isOver = dayTotal > 0 && dailyBudget > 0 && dayTotal > dailyBudget
              const isUnder = dayTotal > 0 && dailyBudget > 0 && dayTotal <= dailyBudget
              const hasActivity = dayExpenses.length > 0

              // Unique category dots (top 3)
              const categories = [...new Set(onlyExpenses.map(e => e.category))].slice(0, 3)

              return (
                <button
                  key={key}
                  onClick={() => {
                    if (hasActivity) setSelectedDay(day)
                  }}
                  className={cn(
                    'relative min-h-[72px] sm:min-h-[80px] p-1.5 border-b border-r border-zinc-100 dark:border-zinc-800/60',
                    'text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500',
                    !isCurrentMonth && 'bg-zinc-50/50 dark:bg-zinc-900/30',
                    isCurrentMonth && 'bg-white dark:bg-zinc-900',
                    hasActivity && 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                    !hasActivity && 'cursor-default',
                    isSelected && 'bg-indigo-50 dark:bg-indigo-950/30',
                    // Remove right border on last col, bottom border on last row
                    (i + 1) % 7 === 0 && 'border-r-0',
                    i >= days.length - 7 && 'border-b-0',
                  )}
                  aria-label={`${format(day, 'MMMM d')}${hasActivity ? `, ${dayExpenses.length} transactions` : ''}`}
                  tabIndex={hasActivity ? 0 : -1}
                >
                  {/* Day number */}
                  <span className={cn(
                    'text-xs font-semibold tabular-nums inline-flex items-center justify-center w-6 h-6 rounded-full',
                    !isCurrentMonth && 'text-zinc-300 dark:text-zinc-600',
                    isCurrentMonth && !isToday && 'text-zinc-700 dark:text-zinc-300',
                    isToday && 'bg-indigo-500 text-white',
                  )}>
                    {format(day, 'd')}
                  </span>

                  {/* Income indicator */}
                  {hasIncome && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" title="Income" />
                  )}

                  {/* Category dots */}
                  {categories.length > 0 && (
                    <div className="flex gap-0.5 mt-1 flex-wrap">
                      {categories.map(cat => (
                        <span
                          key={cat}
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: CATEGORY_COLORS[cat] ?? '#6b7280' }}
                          title={cat}
                        />
                      ))}
                    </div>
                  )}

                  {/* Daily total */}
                  {dayTotal > 0 && (
                    <div className={cn(
                      'absolute bottom-1 right-1.5 text-[9px] font-semibold tabular-nums',
                      isOver ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400',
                    )}>
                      {formatCurrency(dayTotal, settings.currencySymbol, settings.privacyMode)}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-500 font-medium">Red</span>
          <span>= over daily budget</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-indigo-500 inline-flex items-center justify-center text-white font-bold text-[9px]">1</span>
          <span>= today</span>
        </div>
      </div>

      {/* Day detail sheet */}
      <Sheet open={!!selectedDay} onOpenChange={open => !open && setSelectedDay(null)}>
        <SheetContent side="right" className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle>
              {selectedDay ? format(selectedDay, 'EEEE, MMMM d') : ''}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-3 overflow-y-auto">
            {selectedDayExpenses.length === 0 ? (
              <p className="text-sm text-zinc-500">No transactions on this day.</p>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {(() => {
                    const dayIncome = selectedDayExpenses.filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
                    const daySpent = selectedDayExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)
                    return (
                      <>
                        {dayIncome > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                            <p className="text-xs text-green-700 dark:text-green-400 font-medium">Income</p>
                            <AmountDisplay amount={dayIncome} size="md" className="text-green-800 dark:text-green-300" />
                          </div>
                        )}
                        {daySpent > 0 && (
                          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                            <p className="text-xs text-red-700 dark:text-red-400 font-medium">Spent</p>
                            <AmountDisplay amount={daySpent} size="md" className="text-red-800 dark:text-red-300" />
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Transaction list */}
                <div className="space-y-2">
                  {selectedDayExpenses
                    .sort((a, b) => b.amount - a.amount)
                    .map(expense => (
                      <div
                        key={expense.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
                      >
                        <CategoryIcon category={expense.category} size="md" showBackground />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {expense.description}
                          </p>
                          <p className="text-xs text-zinc-500 capitalize">{expense.category}</p>
                        </div>
                        <div className={cn(
                          'text-sm font-semibold tabular-nums flex-shrink-0',
                          expense.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-zinc-800 dark:text-zinc-200',
                        )}>
                          {expense.type === 'income' ? '+' : ''}
                          <AmountDisplay amount={expense.amount} size="sm" />
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
