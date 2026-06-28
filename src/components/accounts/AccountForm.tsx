'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const ICONS = ['🏦', '💳', '💰', '🏧', '🪙', '💵', '🏛️', '📈']

interface AccountFormProps {
  onSubmit: (data: { name: string; icon: string; balance: number; currency: string; notes?: string }) => void
  onClose: () => void
  initial?: { name: string; icon: string; balance: number; currency: string; notes?: string }
}

export function AccountForm({ onSubmit, onClose, initial }: AccountFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [icon, setIcon] = useState(initial?.icon ?? '🏦')
  const [balance, setBalance] = useState(initial?.balance?.toString() ?? '0')
  const [currency, setCurrency] = useState(initial?.currency ?? 'EUR')
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), icon, balance: parseFloat(balance) || 0, currency, notes: notes || undefined })
  }

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
          className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{initial ? 'Ndrysho llogarinë' : 'Shto llogari'}</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Icon picker */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Ikona</label>
              <div className="flex gap-2 flex-wrap">
                {ICONS.map(ic => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setIcon(ic)}
                    className={`text-2xl p-2 rounded-xl border-2 transition-colors ${icon === ic ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/40'}`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Emri i bankës</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="p.sh. Raiffeisen"
                required
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Balance + Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Bilanci</label>
                <input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={e => setBalance(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Valuta</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {['EUR', 'USD', 'ALL', 'GBP', 'CHF'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block">Shënime (opsionale)</label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="p.sh. llogaria kursimit"
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              {initial ? 'Ruaj ndryshimet' : 'Shto llogari'}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
