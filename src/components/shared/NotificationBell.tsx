'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { Bell, X, AlertTriangle, Calendar, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  icon: React.ReactNode
  title: string
  description: string
  severity: 'warning' | 'info' | 'critical'
}

function useNotifications(): Notification[] {
  const { settings, expenses, fixedExpenses, currentMonth } = useFinanceStore()

  return useMemo(() => {
    const notes: Notification[] = []
    const today = new Date()

    // --- Weekly budget usage ---
    if (currentMonth && (settings.notifications.weeklyBudget80 || settings.notifications.weeklyBudget90 || settings.notifications.weeklyBudget100)) {
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      weekStart.setHours(0, 0, 0, 0)

      const weeklySpent = expenses
        .filter(e => {
          const d = new Date(e.date)
          return (
            e.budgetMonthId === currentMonth.id &&
            e.type === 'expense' &&
            d >= weekStart &&
            d <= today
          )
        })
        .reduce((s, e) => s + e.amount, 0)

      const weeklyBudget = currentMonth.weeklyBudget
      const pct = weeklyBudget > 0 ? (weeklySpent / weeklyBudget) * 100 : 0

      if (pct >= 100 && settings.notifications.weeklyBudget100) {
        notes.push({
          id: 'weekly-100',
          icon: <AlertTriangle className="w-4 h-4" />,
          title: 'Weekly budget exceeded',
          description: `You've spent ${formatCurrency(weeklySpent, settings.currencySymbol, settings.privacyMode)} of your ${formatCurrency(weeklyBudget, settings.currencySymbol, settings.privacyMode)} weekly budget.`,
          severity: 'critical',
        })
      } else if (pct >= 90 && settings.notifications.weeklyBudget90) {
        notes.push({
          id: 'weekly-90',
          icon: <AlertTriangle className="w-4 h-4" />,
          title: '90% of weekly budget used',
          description: `${formatCurrency(weeklyBudget - weeklySpent, settings.currencySymbol, settings.privacyMode)} remaining this week.`,
          severity: 'warning',
        })
      } else if (pct >= 80 && settings.notifications.weeklyBudget80) {
        notes.push({
          id: 'weekly-80',
          icon: <Wallet className="w-4 h-4" />,
          title: '80% of weekly budget used',
          description: `${formatCurrency(weeklyBudget - weeklySpent, settings.currencySymbol, settings.privacyMode)} left for the rest of the week.`,
          severity: 'warning',
        })
      }
    }

    // --- Bill due tomorrow ---
    if (settings.notifications.billDue) {
      const tomorrow = today.getDate() + 1
      const dueTomorrow = fixedExpenses.filter(
        fe => fe.dueDay === tomorrow && !fe.isPaid
      )
      for (const fe of dueTomorrow) {
        notes.push({
          id: `bill-${fe.id}`,
          icon: <Calendar className="w-4 h-4" />,
          title: `${fe.name} due tomorrow`,
          description: `${formatCurrency(fe.amount, settings.currencySymbol, settings.privacyMode)} payment scheduled for the ${tomorrow}th.`,
          severity: 'info',
        })
      }
    }

    // --- Salary expected soon (within 3 days) ---
    if (settings.notifications.salaryExpected) {
      const salaryDay = settings.salaryDay ?? 1
      const daysUntil = (() => {
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), salaryDay)
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, salaryDay)
        const target = thisMonth > today ? thisMonth : nextMonth
        return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      })()

      if (daysUntil <= 3 && daysUntil > 0) {
        notes.push({
          id: 'salary-soon',
          icon: <span className="text-sm">💰</span>,
          title: `Salary in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
          description: `${formatCurrency(settings.salary, settings.currencySymbol, settings.privacyMode)} expected on the ${salaryDay}${salaryDay === 1 ? 'st' : salaryDay === 2 ? 'nd' : salaryDay === 3 ? 'rd' : 'th'}.`,
          severity: 'info',
        })
      }
    }

    return notes
  }, [settings, expenses, fixedExpenses, currentMonth])
}

const SEVERITY_STYLES: Record<Notification['severity'], string> = {
  critical: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
}

const SEVERITY_BG: Record<Notification['severity'], string> = {
  critical: 'bg-destructive/10',
  warning: 'bg-warning/10',
  info: 'bg-accent',
}

export function NotificationBell({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const notifications = useNotifications()
  const count = notifications.length

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !buttonRef.current?.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handler(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(v => !v)}
        aria-label={`Notifications${count > 0 ? ` (${count} active)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          'relative inline-flex h-9 w-9 items-center justify-center rounded-lg',
          'text-muted-foreground hover:text-foreground hover:bg-accent',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          open && 'bg-accent text-foreground',
          className,
        )}
      >
        <Bell className="w-4 h-4" />

        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              className={cn(
                'absolute -top-0.5 -right-0.5',
                'flex h-4 min-w-4 items-center justify-center rounded-full px-1',
                'text-[10px] font-bold leading-none',
                'bg-destructive text-destructive-foreground',
              )}
              aria-hidden="true"
            >
              {count > 9 ? '9+' : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            key="panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute right-0 top-11 z-50 w-80',
              'rounded-xl border border-border bg-popover shadow-lg',
              'overflow-hidden',
            )}
            role="dialog"
            aria-label="Notifications"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Notifications</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="max-h-80 overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">You're all caught up</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">No active alerts</p>
                </div>
              ) : (
                <ul className="py-2">
                  {notifications.map((note, i) => (
                    <li key={note.id}>
                      {i > 0 && <div className="mx-4 border-t border-border/50" />}
                      <div className="flex gap-3 px-4 py-3">
                        <span
                          className={cn(
                            'flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center',
                            SEVERITY_BG[note.severity],
                            SEVERITY_STYLES[note.severity],
                          )}
                          aria-hidden="true"
                        >
                          {note.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground leading-snug">
                            {note.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                            {note.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
