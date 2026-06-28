'use client'

import { useState } from 'react'
import { Plus, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAccountsStore } from '@/store/accountsStore'
import { useAuthStore } from '@/store/authStore'
import { AccountCard } from './AccountCard'
import { AccountForm } from './AccountForm'

export function AccountsView() {
  const { accounts, addAccount, isLoaded } = useAccountsStore()
  const { user } = useAuthStore()
  const [showForm, setShowForm] = useState(false)

  const total = accounts.reduce((s, a) => s + a.balance, 0)

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kursimet Personale</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Llogaritë e tua bankare</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} /> Shto llogari
        </button>
      </div>

      {/* Total summary */}
      {accounts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Landmark size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Totali i kursimeve</p>
              <p className="text-2xl font-bold text-primary">
                {total.toLocaleString('sq-AL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Account cards */}
      {accounts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-3 text-center"
        >
          <span className="text-5xl">🏦</span>
          <p className="text-lg font-medium">Nuk ke llogari bankare</p>
          <p className="text-sm text-muted-foreground max-w-xs">Shto llogarinë tënde të parë bankare për të ndjekur kursimet</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} /> Shto llogari
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {showForm && (
        <AccountForm
          onSubmit={data => {
            addAccount(user!.id, data)
            setShowForm(false)
          }}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  )
}
