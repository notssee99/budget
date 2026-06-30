'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarX } from 'lucide-react'
import { toast } from 'sonner'
import { useFinanceStore } from '@/store/financeStore'
import { useAuthStore } from '@/store/authStore'
import { computeDashboard } from '@/lib/calculations'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Button } from '@/components/ui/button'
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
  const { currentMonth, expenses, fixedExpenses, settings, archiveCurrentMonth, startNewMonth } = useFinanceStore()
  const user = useAuthStore(s => s.user)
  const [endMonthOpen, setEndMonthOpen] = useState(false)
  const isFestoni = user?.id === 'festoni'

  const stats = useMemo(
    () => computeDashboard({ currentMonth, expenses, fixedExpenses, settings, userId: user?.id }),
    [currentMonth, expenses, fixedExpenses, settings, user?.id]
  )

  if (!currentMonth) {
    return (
      <div>
        <StartMonthBanner />
      </div>
    )
  }

  function handleEndMonth() {
    archiveCurrentMonth()
    startNewMonth()
    toast.success('Muaji u mbyll dhe filloi muaji i ri!')
    setEndMonthOpen(false)
  }

  return (
    <>
      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* End Month button */}
        <motion.div variants={item} className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground"
            onClick={() => setEndMonthOpen(true)}
          >
            <CalendarX size={15} />
            Mbyll Muajin
          </Button>
        </motion.div>

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

        {/* Row 3: Fixed expenses (Festoni only) + Recent transactions */}
        <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {isFestoni && <FixedExpensesCard totalFixed={stats.totalFixedExpenses} />}
          <RecentTransactions />
        </motion.div>
      </motion.div>

      <ConfirmDialog
        open={endMonthOpen}
        onOpenChange={setEndMonthOpen}
        title="Mbyll Muajin?"
        description="Muaji aktual do të arkivohet dhe do të fillojë një muaj i ri i pastër. Ky veprim nuk mund të kthehet."
        onConfirm={handleEndMonth}
        confirmLabel="Mbyll Muajin"
        variant="destructive"
      />
    </>
  )
}
