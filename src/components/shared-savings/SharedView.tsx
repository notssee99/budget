'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSharedStore } from '@/store/sharedStore'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import { SharedGoalCard } from './SharedGoalCard'
import { SharedGoalForm } from './SharedGoalForm'

export function SharedView() {
  const { goals } = useSharedStore()
  const { settings } = useFinanceStore()
  const [formOpen, setFormOpen] = useState(false)

  const sym = settings.currencySymbol
  const fmt = (n: number) => formatCurrency(n, sym, false)

  const allContribs = goals.flatMap(g => g.contributions)
  const totalSaved = allContribs.reduce((s, c) => s + c.amount, 0)
  const festoniTotal = allContribs.filter(c => c.userId === 'festoni').reduce((s, c) => s + c.amount, 0)
  const odetaTotal = allContribs.filter(c => c.userId === 'odeta').reduce((s, c) => s + c.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Bashkë 🤝</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Kursimet tuaja të përbashkëta</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Qëllim i ri
        </Button>
      </div>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/20 border-indigo-200/60 dark:border-indigo-800/40">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wider mb-1">Gjithsej</p>
              <p className="text-xl font-bold text-indigo-800 dark:text-indigo-300">{fmt(totalSaved)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/30 dark:to-sky-950/20 border-blue-200/60 dark:border-blue-800/40">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">👨 Festoni</p>
              <p className="text-xl font-bold text-blue-800 dark:text-blue-300">{fmt(festoniTotal)}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20 border-pink-200/60 dark:border-pink-800/40">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-pink-700 dark:text-pink-400 uppercase tracking-wider mb-1">👩 Odeta</p>
              <p className="text-xl font-bold text-pink-800 dark:text-pink-300">{fmt(odetaTotal)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Goals grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {goals.map(goal => (
              <SharedGoalCard key={goal.id} goal={goal} />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Asnjë qëllim i përbashkët</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Krijoni qëllime bashkë me Festonin ose Odetën dhe ndiqni progresin tuaj.
          </p>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Krijo qëllimin e parë
          </Button>
        </motion.div>
      )}

      <SharedGoalForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
