'use client'

import { useState, useEffect } from 'react'
import { X, Plus, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { useFinanceStore } from '@/store/financeStore'
import { CATEGORY_CONFIG } from '@/lib/categoryDetection'
import { cn } from '@/lib/utils'
import type { Category, TransactionType } from '@/types'

interface QuickAddProps {
  onClose?: () => void
}

const CATEGORIES = Object.entries(CATEGORY_CONFIG)
  .filter(([key]) => !['salary'].includes(key))
  .map(([key, val]) => ({ key: key as Category, ...val }))

const TYPES: { value: TransactionType; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'expense', label: 'Shpenzim', icon: <TrendingDown className="w-4 h-4" />, color: 'bg-rose-500 text-white' },
  { value: 'income',  label: 'Të ardhura', icon: <TrendingUp className="w-4 h-4" />, color: 'bg-emerald-500 text-white' },
  { value: 'savings', label: 'Kursim', icon: <PiggyBank className="w-4 h-4" />, color: 'bg-indigo-500 text-white' },
]

export function QuickAdd({ onClose }: QuickAddProps) {
  const { addExpense, settings } = useFinanceStore()
  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<Category>('other')
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [success, setSuccess] = useState(false)

  // Auto-set category based on type
  useEffect(() => {
    if (type === 'savings') setCategory('savings')
    else if (type === 'income') setCategory('salary')
    else setCategory('other')
  }, [type])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const num = parseFloat(amount)
    if (!num || num <= 0 || !description.trim()) return

    addExpense({ amount: num, description: description.trim(), category, type, date })
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      setAmount('')
      setDescription('')
      onClose?.()
    }, 800)
  }

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose?.() }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Transaksion i Ri</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-5 pt-4 pb-6 space-y-4">

            {/* Type tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted rounded-xl">
              {TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-all',
                    type === t.value
                      ? t.color + ' shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Shuma ({settings.currencySymbol})</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Përshkrimi</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="p.sh. Kafe, Karburanti, Rroga..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-muted-foreground/50"
              />
            </div>

            {/* Category */}
            {type === 'expense' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Kategoria</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {CATEGORIES.filter(c => !['savings','salary'].includes(c.key)).slice(0, 10).map(c => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => setCategory(c.key)}
                      title={c.label}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-xl py-2 text-lg transition-all border',
                        category === c.key
                          ? 'bg-primary/10 border-primary/40 scale-105'
                          : 'bg-muted/50 border-transparent hover:bg-muted'
                      )}
                    >
                      <span>{c.icon}</span>
                      <span className="text-[9px] text-muted-foreground leading-none truncate w-full text-center px-1">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Data</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!amount || !description.trim() || success}
              className={cn(
                'w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all',
                success
                  ? 'bg-emerald-500 text-white'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed'
              )}
            >
              {success ? (
                '✓ U shtua me sukses!'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Shto Transaksionin
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
