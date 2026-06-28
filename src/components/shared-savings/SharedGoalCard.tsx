'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Trash2, Plus, Trash } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSharedStore } from '@/store/sharedStore'
import { useAuthStore } from '@/store/authStore'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'
import type { SharedSavingsGoal } from '@/types'
import { SharedGoalForm } from './SharedGoalForm'
import { cn } from '@/lib/utils'

interface Props {
  goal: SharedSavingsGoal
}

const USER_AVATAR: Record<string, string> = { festoni: '👨', odeta: '👩' }

export function SharedGoalCard({ goal }: Props) {
  const { deleteGoal, addContribution, deleteContribution } = useSharedStore()
  const { user } = useAuthStore()
  const { settings } = useFinanceStore()
  const [contribOpen, setContribOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const sym = settings.currencySymbol
  const fmt = (n: number) => formatCurrency(n, sym, false)

  const totalSaved = goal.contributions.reduce((s, c) => s + c.amount, 0)
  const progress = goal.targetAmount > 0 ? Math.min(100, (totalSaved / goal.targetAmount) * 100) : 0
  const remaining = Math.max(0, goal.targetAmount - totalSaved)

  const byUser: Record<string, number> = {}
  for (const c of goal.contributions) {
    byUser[c.userId] = (byUser[c.userId] ?? 0) + c.amount
  }

  const recent = [...goal.contributions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  function handleContrib() {
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) { toast.error('Shto një shumë të vlefshme'); return }
    if (!user) return
    addContribution(goal.id, {
      userId: user.id,
      userName: user.name,
      amount: num,
      description: description.trim() || goal.name,
      date: format(new Date(), 'yyyy-MM-dd'),
    })
    toast.success(`${fmt(num)} u shtua te "${goal.name}"`)
    setAmount('')
    setDescription('')
    setContribOpen(false)
  }

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} layout>
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 hover:shadow-md transition-shadow">
          <CardContent className="p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-2xl flex-shrink-0 ring-1 ring-indigo-200 dark:ring-indigo-800">
                  {goal.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{goal.name}</h3>
                  {goal.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">{goal.description}</p>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button size="sm" variant="outline" className="px-2" onClick={() => setEditOpen(true)}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="sm" variant="outline" className="px-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800" onClick={() => { deleteGoal(goal.id); toast.success('U fshi') }}><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{fmt(totalSaved)}</span>
                <span className="text-zinc-500 dark:text-zinc-400">nga {fmt(goal.targetAmount)}</span>
              </div>
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{Math.round(progress)}%</span>
                {remaining > 0 && <span>{fmt(remaining)} mbetur</span>}
              </div>
            </div>

            {/* Per-user breakdown */}
            <div className="flex gap-3">
              {['festoni', 'odeta'].map(uid => (
                <div key={uid} className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-2.5 text-center">
                  <div className="text-xl mb-0.5">{USER_AVATAR[uid]}</div>
                  <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 capitalize">{uid === 'festoni' ? 'Festoni' : 'Odeta'}</div>
                  <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{fmt(byUser[uid] ?? 0)}</div>
                </div>
              ))}
            </div>

            {/* Recent contributions */}
            {recent.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Kontributet e fundit</p>
                <div className="space-y-1">
                  {recent.map(c => (
                    <div key={c.id} className="flex items-center justify-between text-sm py-1 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span>{USER_AVATAR[c.userId] ?? '👤'}</span>
                        <span className="text-zinc-600 dark:text-zinc-400 truncate">{c.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{fmt(c.amount)}</span>
                        <span className="text-xs text-zinc-400">{format(parseISO(c.date), 'dd MMM')}</span>
                        <button
                          onClick={() => deleteContribution(goal.id, c.id)}
                          className="text-zinc-300 hover:text-red-400 transition-colors"
                          aria-label="Fshi kontributin"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contribute button */}
            <Button className="w-full gap-2" onClick={() => setContribOpen(true)}>
              <Plus className="w-4 h-4" />
              Kontribuo
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contribute dialog */}
      <Dialog open={contribOpen} onOpenChange={setContribOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {goal.icon} Kontribuo te &quot;{goal.name}&quot;
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {user && (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                <span>{USER_AVATAR[user.id] ?? '👤'}</span>
                <span>Duke kontribuar si <strong>{user.name}</strong></span>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Shuma</Label>
              <Input
                type="number" min="0.01" step="0.01" placeholder="0.00"
                value={amount} onChange={e => setAmount(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleContrib()}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label>Përshkrim <span className="text-zinc-400 font-normal">(opsional)</span></Label>
              <Input placeholder={goal.name} value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setContribOpen(false)}>Anulo</Button>
              <Button className="flex-1" onClick={handleContrib}>Shto</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SharedGoalForm open={editOpen} onOpenChange={setEditOpen} goal={goal} />
    </>
  )
}
