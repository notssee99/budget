'use client'

import { useState } from 'react'
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BankAccount } from '@/types'

interface FundsModalProps {
  account: BankAccount
  type: 'add' | 'remove'
  onSubmit: (amount: number, description: string) => void
  onClose: () => void
}

export function FundsModal({ account, type, onSubmit, onClose }: FundsModalProps) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount)
    if (!num || num <= 0) return
    onSubmit(num, description.trim() || (type === 'add' ? 'Depozitë' : 'Tërheqje'))
    onClose()
  }

  const isAdd = type === 'add'
  const Icon = isAdd ? ArrowDownCircle : ArrowUpCircle

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon size={20} className={isAdd ? 'text-green-500' : 'text-red-500'} />
              <h2 className="text-base font-semibold">{isAdd ? 'Shto para' : 'Hiq para'} · {account.name}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Shuma ({account.currency ?? 'EUR'})</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
                required
                placeholder="0.00"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Përshkrim (opsional)</label>
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isAdd ? 'p.sh. pagë' : 'p.sh. blerje'}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition-colors text-white ${isAdd ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isAdd ? 'Shto' : 'Hiq'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
