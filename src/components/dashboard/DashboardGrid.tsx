'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useFinanceStore } from '@/store/financeStore'
import { computeDashboard } from '@/lib/calculations'
import StartMonthBanner from './StartMonthBanner'
import BalanceCard from './BalanceCard'
import WeeklyBudgetCard from './WeeklyBudgetCard'
import SavingsCard from './SavingsCard'
import DailySpendCard from './DailySpendCard'
import BudgetStatusCard from './BudgetStatusCard'
import FixedExpensesCard from './FixedExpensesCard'
import RecentTransactions from './RecentTransactions'
import IncomeCard from './IncomeCard'

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
}

export default function DashboardGrid() {
  const { currentMonth, expenses, fixedExpenses, settings } = useFinanceStore()

  const stats = useMemo(
    () => computeDashboard({ currentMonth, expenses, fixedExpenses, settings }),
    [currentMonth, expenses, fixedExpenses, settings]
  )

  if (!currentMonth) {
    return (
      <div>
        <StartMonthBanner />
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Row 1: 4 key numbers */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <IncomeCard />
        <BalanceCard stats={stats} />
        <WeeklyBudgetCard stats={stats} />
        <DailySpendCard stats={stats} />
      </motion.div>

      {/* Row 2: Status + Savings */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <BudgetStatusCard stats={stats} />
        <SavingsCard stats={stats} />
      </motion.div>

      {/* Row 3: Fixed expenses + Recent transactions */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <FixedExpensesCard totalFixed={stats.totalFixedExpenses} />
        <RecentTransactions />
      </motion.div>
    </motion.div>
  )
}
