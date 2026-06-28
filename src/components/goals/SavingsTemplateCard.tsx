'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AmountDisplay } from '@/components/shared/AmountDisplay'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import type { SavingsTemplate } from '@/types'
import { SavingsTemplateForm } from './SavingsTemplateForm'

interface SavingsTemplateCardProps {
  template: SavingsTemplate
}

export function SavingsTemplateCard({ template }: SavingsTemplateCardProps) {
  const { deleteSavingsTemplate, useSavingsTemplate, settings } = useFinanceStore()
  const [useOpen, setUseOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [amount, setAmount] = useState(String(template.amount))

  function handleUse() {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    useSavingsTemplate(template.id, val)
    toast.success(`${formatCurrency(val, settings.currencySymbol)} saved as "${template.name}"`)
    setUseOpen(false)
  }

  function handleDelete() {
    deleteSavingsTemplate(template.id)
    toast.success(`"${template.name}" deleted`)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        layout
      >
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl flex-shrink-0">
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 truncate">
                    {template.name}
                  </h3>
                  {template.category && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                      {template.category}
                    </span>
                  )}
                </div>
                {template.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                    {template.description}
                  </p>
                )}
                <div className="mt-1">
                  <AmountDisplay amount={template.amount} size="sm" className="font-semibold text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs text-zinc-400 ml-1">default</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" className="flex-1 gap-1.5" onClick={() => { setAmount(String(template.amount)); setUseOpen(true) }}>
                <Plus className="w-3.5 h-3.5" />
                Add as Expense
              </Button>
              <Button size="sm" variant="outline" className="px-2.5" onClick={() => setEditOpen(true)} aria-label="Edit">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="px-2.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800"
                onClick={handleDelete}
                aria-label="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={useOpen} onOpenChange={setUseOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{template.icon}</span> {template.name}
            </DialogTitle>
            <DialogDescription>
              Konfirmo shumën që do të shtohet si shpenzim kursimi.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="use-amount">Shuma ({settings.currencySymbol})</Label>
              <Input
                id="use-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleUse()}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setUseOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleUse}>
                Add {settings.currencySymbol}{amount || '0'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SavingsTemplateForm open={editOpen} onOpenChange={setEditOpen} template={template} />
    </>
  )
}
