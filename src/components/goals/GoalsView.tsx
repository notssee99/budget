'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, PiggyBank } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { useFinanceStore } from '@/store/financeStore'
import { SavingsTemplateCard } from './SavingsTemplateCard'
import { SavingsTemplateForm } from './SavingsTemplateForm'

export function GoalsView() {
  const { savingsTemplates, expenses, currentMonth } = useFinanceStore()
  const [formOpen, setFormOpen] = useState(false)

  const totalSavedThisMonth = expenses
    .filter(e => e.budgetMonthId === (currentMonth?.id ?? '') && e.type === 'savings')
    .reduce((s, e) => s + e.amount, 0)

  // Group templates by category
  const grouped: Record<string, typeof savingsTemplates> = {}
  const uncategorized: typeof savingsTemplates = []

  for (const t of savingsTemplates) {
    if (t.category) {
      if (!grouped[t.category]) grouped[t.category] = []
      grouped[t.category].push(t)
    } else {
      uncategorized.push(t)
    }
  }

  const categoryGroups = Object.entries(grouped)
  const hasTemplates = savingsTemplates.length > 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Savings</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kursime si shpenzime — template-t për shtim të shpejtë
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* This month summary */}
      <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/20 border-indigo-200/60 dark:border-indigo-800/40">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
            <PiggyBank className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Saved This Month</p>
            <AmountDisplay amount={totalSavedThisMonth} size="lg" className="text-indigo-800 dark:text-indigo-300" />
          </div>
        </CardContent>
      </Card>

      {hasTemplates ? (
        <div className="space-y-8">
          {/* Categorized groups */}
          {categoryGroups.map(([category, templates]) => (
            <div key={category}>
              <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400" />
                {category}
                <span className="text-zinc-400 font-normal normal-case">({templates.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {templates.map(template => (
                    <SavingsTemplateCard key={template.id} template={template} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {/* Uncategorized */}
          {uncategorized.length > 0 && (
            <div>
              {categoryGroups.length > 0 && (
                <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  Të tjera
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {uncategorized.map(template => (
                    <SavingsTemplateCard key={template.id} template={template} />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <PiggyBank className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-1">No templates yet</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs mb-6">
            Krijo template për kursime — p.sh. &quot;Trip 1&quot; ose &quot;Fond emergjence&quot; — dhe shtoji si shpenzime me një klik.
          </p>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create first template
          </Button>
        </motion.div>
      )}

      <SavingsTemplateForm open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
