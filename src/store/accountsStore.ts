// Supabase tables needed — run in SQL Editor:
// create table if not exists bank_accounts (id text primary key, user_id text not null, name text not null, icon text not null default '🏦', balance numeric not null default 0, currency text default 'EUR', notes text, created_at text not null);
// alter table bank_accounts enable row level security;
// create policy public_access on bank_accounts for all using (true) with check (true);
// create table if not exists account_transactions (id text primary key, account_id text references bank_accounts(id) on delete cascade, user_id text not null, amount numeric not null, description text not null, date text not null, type text not null);
// alter table account_transactions enable row level security;
// create policy public_access on account_transactions for all using (true) with check (true);

import { create } from 'zustand'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import type { BankAccount, AccountTransaction } from '@/types'

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
const today = () => format(new Date(), 'yyyy-MM-dd')

function toAccount(row: Record<string, unknown>): BankAccount {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    icon: row.icon as string,
    balance: Number(row.balance),
    currency: (row.currency as string) ?? 'EUR',
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

function toTx(row: Record<string, unknown>): AccountTransaction {
  return {
    id: row.id as string,
    accountId: row.account_id as string,
    userId: row.user_id as string,
    amount: Number(row.amount),
    description: row.description as string,
    date: row.date as string,
    type: row.type as 'deposit' | 'withdrawal',
  }
}

interface AccountsState {
  accounts: BankAccount[]
  transactions: AccountTransaction[]
  isLoaded: boolean

  loadAccounts: (userId: string) => Promise<void>
  addAccount: (userId: string, data: Omit<BankAccount, 'id' | 'userId' | 'createdAt'>) => Promise<void>
  updateAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>
  deleteAccount: (id: string) => Promise<void>
  addFunds: (accountId: string, userId: string, amount: number, description: string) => Promise<void>
  removeFunds: (accountId: string, userId: string, amount: number, description: string) => Promise<void>
}

export const useAccountsStore = create<AccountsState>((set, get) => ({
  accounts: [],
  transactions: [],
  isLoaded: false,

  loadAccounts: async (userId) => {
    const [{ data: accs }, { data: txs }] = await Promise.all([
      supabase.from('bank_accounts').select('*').eq('user_id', userId).order('created_at'),
      supabase.from('account_transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    ])
    set({
      accounts: (accs ?? []).map(toAccount),
      transactions: (txs ?? []).map(toTx),
      isLoaded: true,
    })
  },

  addAccount: async (userId, data) => {
    const newAcc: BankAccount = { ...data, id: uid(), userId, createdAt: today() }
    set(s => ({ accounts: [...s.accounts, newAcc] }))
    await supabase.from('bank_accounts').insert({
      id: newAcc.id, user_id: userId, name: newAcc.name,
      icon: newAcc.icon, balance: newAcc.balance,
      currency: newAcc.currency ?? 'EUR', notes: newAcc.notes ?? null,
      created_at: newAcc.createdAt,
    })
  },

  updateAccount: async (id, updates) => {
    set(s => ({ accounts: s.accounts.map(a => a.id === id ? { ...a, ...updates } : a) }))
    const row: Record<string, unknown> = {}
    if (updates.name !== undefined) row.name = updates.name
    if (updates.icon !== undefined) row.icon = updates.icon
    if (updates.balance !== undefined) row.balance = updates.balance
    if (updates.notes !== undefined) row.notes = updates.notes
    if (updates.currency !== undefined) row.currency = updates.currency
    await supabase.from('bank_accounts').update(row).eq('id', id)
  },

  deleteAccount: async (id) => {
    set(s => ({
      accounts: s.accounts.filter(a => a.id !== id),
      transactions: s.transactions.filter(t => t.accountId !== id),
    }))
    await supabase.from('bank_accounts').delete().eq('id', id)
  },

  addFunds: async (accountId, userId, amount, description) => {
    const tx: AccountTransaction = { id: uid(), accountId, userId, amount: Math.abs(amount), description, date: today(), type: 'deposit' }
    set(s => ({
      accounts: s.accounts.map(a => a.id === accountId ? { ...a, balance: a.balance + Math.abs(amount) } : a),
      transactions: [tx, ...s.transactions],
    }))
    await Promise.all([
      supabase.from('account_transactions').insert({ id: tx.id, account_id: accountId, user_id: userId, amount: tx.amount, description, date: tx.date, type: 'deposit' }),
      supabase.from('bank_accounts').update({ balance: get().accounts.find(a => a.id === accountId)?.balance }).eq('id', accountId),
    ])
  },

  removeFunds: async (accountId, userId, amount, description) => {
    const abs = Math.abs(amount)
    const tx: AccountTransaction = { id: uid(), accountId, userId, amount: -abs, description, date: today(), type: 'withdrawal' }
    set(s => ({
      accounts: s.accounts.map(a => a.id === accountId ? { ...a, balance: a.balance - abs } : a),
      transactions: [tx, ...s.transactions],
    }))
    await Promise.all([
      supabase.from('account_transactions').insert({ id: tx.id, account_id: accountId, user_id: userId, amount: tx.amount, description, date: tx.date, type: 'withdrawal' }),
      supabase.from('bank_accounts').update({ balance: get().accounts.find(a => a.id === accountId)?.balance }).eq('id', accountId),
    ])
  },
}))
