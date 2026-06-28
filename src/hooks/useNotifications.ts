'use client'

import { useMemo } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import { getDay, getMonth, getYear, addDays, format } from 'date-fns'

export type NotificationSeverity = 'info' | 'warning' | 'error'

export interface NotificationItem {
  id: string
  type: 'weekly_budget_80' | 'weekly_budget_90' | 'weekly_budget_100' | 'bill_due' | 'salary_expected'
  title: string
  description: string
  severity: NotificationSeverity
}

export function useNotifications(): { notifications: NotificationItem[]; count: number } {
  const settings = useFinanceStore(s => s.settings)
  const currentMonth = useFinanceStore(s => s.currentMonth)
  const expenses = useFinanceStore(s => s.expenses)
  const fixedExpenses = useFinanceStore(s => s.fixedExpenses)

  const notifications = useMemo<NotificationItem[]>(() => {
    const items: NotificationItem[] = []
    const now = new Date()
    const tomorrow = addDays(now, 1)
    const tomorrowDay = tomorrow.getDate()
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')

    // --- Weekly budget notifications ---
    if (currentMonth) {
      // Calculate current week start (Monday)
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1 // 0=Mon
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - dayOfWeek)
      weekStart.setHours(0, 0, 0, 0)

      const weekStartStr = format(weekStart, 'yyyy-MM-dd')

      const weeklySpent = expenses
        .filter(
          e =>
            e.budgetMonthId === currentMonth.id &&
            e.type === 'expense' &&
            e.date >= weekStartStr
        )
        .reduce((sum, e) => sum + e.amount, 0)

      const weeklyBudget = currentMonth.weeklyBudget
      const pct = weeklyBudget > 0 ? (weeklySpent / weeklyBudget) * 100 : 0

      if (pct >= 100 && settings.notifications.weeklyBudget100) {
        items.push({
          id: 'weekly_budget_100',
          type: 'weekly_budget_100',
          title: 'Weekly budget exceeded',
          description: `You've used ${Math.round(pct)}% of your ${settings.currencySymbol}${weeklyBudget.toFixed(0)} weekly budget.`,
          severity: 'error',
        })
      } else if (pct >= 90 && settings.notifications.weeklyBudget90) {
        items.push({
          id: 'weekly_budget_90',
          type: 'weekly_budget_90',
          title: 'Weekly budget at 90%',
          description: `You've used ${Math.round(pct)}% of your weekly budget. Slow down to avoid overspending.`,
          severity: 'warning',
        })
      } else if (pct >= 80 && settings.notifications.weeklyBudget80) {
        items.push({
          id: 'weekly_budget_80',
          type: 'weekly_budget_80',
          title: 'Weekly budget at 80%',
          description: `You've used ${Math.round(pct)}% of your weekly budget this week.`,
          severity: 'warning',
        })
      }
    }

    // --- Fixed expenses due tomorrow ---
    if (settings.notifications.billDue) {
      const dueTomorrow = fixedExpenses.filter(
        fe => fe.dueDay === tomorrowDay && !fe.isPaid
      )
      for (const fe of dueTomorrow) {
        items.push({
          id: `bill_due_${fe.id}`,
          type: 'bill_due',
          title: `${fe.name} due tomorrow`,
          description: `${settings.currencySymbol}${fe.amount.toFixed(2)} is due on ${tomorrowStr}.`,
          severity: 'info',
        })
      }
    }

    // --- Salary expected tomorrow ---
    if (settings.notifications.salaryExpected) {
      if (tomorrowDay === settings.salaryDay) {
        items.push({
          id: 'salary_expected',
          type: 'salary_expected',
          title: 'Salary arriving tomorrow',
          description: `Your salary of ${settings.currencySymbol}${settings.salary.toFixed(2)} is expected tomorrow.`,
          severity: 'info',
        })
      }
    }

    return items
  }, [settings, currentMonth, expenses, fixedExpenses])

  return { notifications, count: notifications.length }
}
