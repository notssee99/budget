'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { useAccountsStore } from '@/store/accountsStore'
import { useAuthStore } from '@/store/authStore'
import { AccountForm } from './AccountForm'
import { FundsModal } from './FundsModal'
import type { BankAccount } from '@/types'

interface AccountCardProps {
  account: BankAccount
}

export function AccountCard({ account }: AccountCardProps) {
  const { transactions, updateAccount, deleteAccount, addFunds, removeFunds } = useAccountsStore()
  const { user } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [fundsModal, setFundsModal] = useState<'add' | 'remove' | null>(null)
  const [showHistory, setShowHistory] = useState(false)

  const myTxs = transactions.filter(t => t.accountId === account.id).slice(0, 20)

  const handleUpdate = (data: Partial<BankAccount>) => {
    updateAccount(account.id, data)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirm(`Fshi llogarinë "${account.name}"?`)) {
      deleteAccount(account.id)
    }
  }

  return (
    <>
      <motion.div
        layout
        className="bg-card border border-border rounded-2xl p-5 space-y-4"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{account.icon}</span>
            <div>
              <p className="font-semibold text-base">{account.name}</p>
              {account.notes && <p className="text-xs text-muted-foreground">{account.notes}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <Pencil size={14} />
            </button>
            <button onClick={handleDelete} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Balance */}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Gjendja</p>
          <p className="text-2xl font-bold">
            {account.balance.toLocaleString('sq-AL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            <span className="text-sm font-normal text-muted-foreground ml-1">{account.currency ?? 'EUR'}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setFundsModal('add')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors text-sm font-medium"
          >
            <Plus size={14} /> Shto
          </button>
          <button
            onClick={() => setFundsModal('remove')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <Minus size={14} /> Hiq
          </button>
        </div>

        {/* Transaction history toggle */}
        {myTxs.length > 0 && (
          <div>
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              Historiku ({myTxs.length})
            </button>
            {showHistory && (
              <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                {myTxs.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-muted/40 transition-colors">
                    <div>
                      <p className="text-xs font-medium">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">{format(parseISO(tx.date), 'dd MMM yyyy')}</p>
                    </div>
                    <span className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString('sq-AL', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {editing && (
        <AccountForm
          initial={{ ...account, currency: account.currency ?? 'EUR' }}
          onSubmit={data => handleUpdate(data)}
          onClose={() => setEditing(false)}
        />
      )}

      {fundsModal && (
        <FundsModal
          account={account}
          type={fundsModal}
          onSubmit={(amount, description) => {
            if (fundsModal === 'add') addFunds(account.id, user!.id, amount, description)
            else removeFunds(account.id, user!.id, amount, description)
          }}
          onClose={() => setFundsModal(null)}
        />
      )}
    </>
  )
}
