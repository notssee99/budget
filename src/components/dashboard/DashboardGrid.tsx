'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarX } from 'lucide-react'
import { toast } from 'sonner'
import { differenceInDays, startOfMonth, addMonths, parseISO, format } from 'date-fns'
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

  // Allow closing only within 3 days of the next calendar month
  const canEndMonth = useMemo(() => {
    const today = new Date()
    const nextMonthStart = startOfMonth(addMonths(today, 1))
    return differenceInDays(nextMonthStart, today) <= 3
  }, [])

  const currentMonthLabel = currentMonth
    ? format(parseISO(currentMonth.startDate), 'MMMM yyyy')
    : null

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
        {/* Month label (mobile) + End Month button */}
        <motion.div variants={item} className="flex items-center justify-between">
          {currentMonthLabel && (
            <span className="sm:hidden text-sm font-semibold text-foreground">
              📅 {currentMonthLabel}
            </span>
          )}
          <div className="ml-auto">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-muted-foreground"
              onClick={() => setEndMonthOpen(true)}
              disabled={!canEndMonth}
              title={canEndMonth ? undefined : 'Muaji mund të mbyllet vetëm 3 ditë para muajit të ri'}
            >
              <CalendarX size={15} />
              Mbyll Muajin
            </Button>
            {!canEndMonth && (
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                E disponueshme 3 ditë para muajit të ri
              </p>
            )}
          </div>
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
        title={`Mbyll ${currentMonthLabel ?? 'Muajin'}?`}
        description={`Muaji ${currentMonthLabel ?? 'aktual'} do të arkivohet dhe do të fillojë muaji i ri. Shpenzimet fikse të papaguara nuk do të transferohen. Ky veprim nuk mund të kthehet.`}
        onConfirm={handleEndMonth}
        confirmLabel="Mbyll Muajin"
        variant="destructive"
      />
    </>
  )
}
