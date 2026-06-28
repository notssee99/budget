'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useFinanceStore } from '@/store/financeStore'
import { SpendingChart } from './SpendingChart'
import { CategoryChart } from './CategoryChart'
import { MonthlyComparison } from './MonthlyComparison'
import { SavingsChart } from './SavingsChart'
import { getAllWeekSummaries, formatCurrency } from '@/lib/calculations'
import { Card, CardContent } from '@/components/ui/card'
import { AmountDisplay } from '@/components/shared/AmountDisplay'

export function StatisticsView() {
  const { currentMonth, months, expenses, settings } = useFinanceStore()

  // All months including current for comparison
  const allMonths = [
    ...months,
    ...(currentMonth ? [currentMonth] : []),
  ]

  const currentExpenses = currentMonth
    ? expenses.filter(e => e.budgetMonthId === currentMonth.id)
    : []

  const weeks = currentMonth ? getAllWeekSummaries(currentMonth, expenses) : []
  const weeklyData = weeks.map(w => ({
    week: `Week ${w.weekNumber}`,
    spent: w.spent,
    budget: w.budget,
    remaining: Math.max(0, w.remaining),
    percentUsed: w.percentUsed,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Statistics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Spending patterns, category breakdowns, and trends
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-4 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SpendingChart expenses={expenses} currentMonth={currentMonth} />
            <CategoryChart expenses={currentExpenses} monthId={currentMonth?.id} />
          </div>

          {/* Quick stats */}
          {currentMonth && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: 'This month spent',
                  value: <AmountDisplay amount={currentExpenses.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0)} size="md" />,
                },
                {
                  label: 'Monthly income',
                  value: <AmountDisplay amount={currentMonth.income} size="md" />,
                },
                {
                  label: 'Weeks tracked',
                  value: <span className="text-base font-semibold tabular-nums">{weeks.length}</span>,
                },
                {
                  label: 'Avg weekly spend',
                  value: weeks.length > 0
                    ? <AmountDisplay amount={weeks.reduce((s, w) => s + w.spent, 0) / weeks.length} size="md" />
                    : <span className="text-base font-semibold">—</span>,
                },
              ].map(stat => (
                <Card key={stat.label} className="border-zinc-200/60 dark:border-zinc-800/60">
                  <CardContent className="p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">{stat.label}</p>
                    <div className="text-zinc-900 dark:text-zinc-100">{stat.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories tab */}
        <TabsContent value="categories" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CategoryChart expenses={expenses} />
            {currentMonth && (
              <CategoryChart expenses={currentExpenses} monthId={currentMonth.id} />
            )}
          </div>
        </TabsContent>

        {/* Trends tab */}
        <TabsContent value="trends" className="space-y-4 mt-0">
          <MonthlyComparison months={allMonths} expenses={expenses} />

          {/* Week-by-week summary table */}
          {weeklyData.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">Week-by-week breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800">
                        {['Week', 'Budget', 'Spent', 'Remaining', 'Usage'].map(h => (
                          <th key={h} className="text-left py-2 px-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 first:pl-0 last:pr-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {weeklyData.map(row => {
                        const over = row.percentUsed > 100
                        return (
                          <tr key={row.week} className="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0">
                            <td className="py-2.5 pl-0 pr-2 font-medium text-zinc-700 dark:text-zinc-300">{row.week}</td>
                            <td className="py-2.5 px-2 tabular-nums text-zinc-600 dark:text-zinc-400">
                              {formatCurrency(row.budget, settings.currencySymbol, settings.privacyMode)}
                            </td>
                            <td className={`py-2.5 px-2 tabular-nums font-semibold ${over ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'}`}>
                              {formatCurrency(row.spent, settings.currencySymbol, settings.privacyMode)}
                            </td>
                            <td className={`py-2.5 px-2 tabular-nums ${row.remaining > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                              {row.remaining > 0
                                ? `${settings.privacyMode ? '' : '+'}${formatCurrency(row.remaining, settings.currencySymbol, settings.privacyMode)}`
                                : formatCurrency(row.remaining, settings.currencySymbol, settings.privacyMode)}
                            </td>
                            <td className="py-2.5 pr-0 pl-2">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex-shrink-0">
                                  <div
                                    className={`h-full rounded-full ${over ? 'bg-red-500' : 'bg-indigo-500'}`}
                                    style={{ width: `${Math.min(100, row.percentUsed)}%` }}
                                  />
                                </div>
                                <span className={`text-xs tabular-nums ${over ? 'text-red-500' : 'text-zinc-500'}`}>
                                  {Math.round(row.percentUsed)}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Savings tab */}
        <TabsContent value="savings" className="space-y-4 mt-0">
          <SavingsChart expenses={expenses} months={months} currentMonth={currentMonth} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
