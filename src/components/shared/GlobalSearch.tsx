'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, X, TrendingUp, ShoppingBag, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { useFinanceStore } from '@/store/financeStore'
import { CATEGORY_CONFIG } from '@/lib/categoryDetection'
import { formatCurrency, formatDate } from '@/lib/calculations'
import { cn } from '@/lib/utils'
import type { Expense } from '@/types'

function scoreMatch(expense: Expense, query: string): boolean {
  const q = query.toLowerCase()
  return (
    expense.description.toLowerCase().includes(q) ||
    expense.category.toLowerCase().includes(q) ||
    CATEGORY_CONFIG[expense.category].label.toLowerCase().includes(q) ||
    expense.amount.toString().includes(q) ||
    formatDate(expense.date).toLowerCase().includes(q) ||
    (expense.notes?.toLowerCase().includes(q) ?? false)
  )
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { expenses, settings } = useFinanceStore()

  // Cmd+K / Ctrl+K listener
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const results: Expense[] = query.trim()
    ? expenses
        .filter(e => scoreMatch(e, query.trim()))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 20)
    : []

  // Group results
  const incomeResults = results.filter(e => e.type === 'income')
  const savingsResults = results.filter(e => e.type === 'savings')
  const expenseResults = results.filter(e => e.type === 'expense')

  const recentExpenses = !query.trim()
    ? [...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 6)
    : []

  function close() {
    setOpen(false)
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Search transactions (Cmd+K)"
        className={cn(
          'inline-flex h-9 w-9 items-center justify-center gap-2 rounded-lg px-0 sm:w-auto sm:px-3',
          'bg-muted/60 hover:bg-muted border border-border/60',
          'text-sm text-muted-foreground',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Search…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono opacity-60">
          <span>⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="w-[calc(100vw-2rem)] p-0 gap-0 max-w-lg overflow-hidden"
          aria-describedby={undefined}
        >
          <DialogTitle className="sr-only">Search transactions</DialogTitle>

          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && close()}
              placeholder="Search expenses, categories, dates…"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none border-none ring-0"
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait">
              {query.trim() ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {results.length === 0 ? (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      No transactions match "{query}"
                    </div>
                  ) : (
                    <div className="py-2">
                      {expenseResults.length > 0 && (
                        <ResultGroup
                          icon={<ShoppingBag className="w-3.5 h-3.5" />}
                          label="Expenses"
                          items={expenseResults}
                          currencySymbol={settings.currencySymbol}
                          onSelect={close}
                        />
                      )}
                      {incomeResults.length > 0 && (
                        <ResultGroup
                          icon={<TrendingUp className="w-3.5 h-3.5" />}
                          label="Income"
                          items={incomeResults}
                          currencySymbol={settings.currencySymbol}
                          onSelect={close}
                        />
                      )}
                      {savingsResults.length > 0 && (
                        <ResultGroup
                          icon={<span className="text-xs">🏦</span>}
                          label="Savings"
                          items={savingsResults}
                          currencySymbol={settings.currencySymbol}
                          onSelect={close}
                        />
                      )}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="recent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {recentExpenses.length > 0 && (
                    <div className="py-2">
                      <ResultGroup
                        icon={<Clock className="w-3.5 h-3.5" />}
                        label="Recent"
                        items={recentExpenses}
                        currencySymbol={settings.currencySymbol}
                        onSelect={close}
                      />
                    </div>
                  )}
                  {recentExpenses.length === 0 && (
                    <div className="py-12 text-center text-sm text-muted-foreground">
                      No transactions yet
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30">
            <span className="text-[11px] text-muted-foreground">
              {results.length > 0 && query
                ? `${results.length} result${results.length !== 1 ? 's' : ''}`
                : 'Type to search'}
            </span>
            <kbd className="text-[10px] font-mono text-muted-foreground">esc to close</kbd>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface ResultGroupProps {
  icon: React.ReactNode
  label: string
  items: Expense[]
  currencySymbol: string
  onSelect: () => void
}

function ResultGroup({ icon, label, items, currencySymbol, onSelect }: ResultGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      {items.map(item => (
        <ResultItem
          key={item.id}
          expense={item}
          currencySymbol={currencySymbol}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface ResultItemProps {
  expense: Expense
  currencySymbol: string
  onSelect: () => void
}

function ResultItem({ expense, currencySymbol, onSelect }: ResultItemProps) {
  const config = CATEGORY_CONFIG[expense.category]
  const isIncome = expense.type === 'income'
  const { settings } = useFinanceStore()

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5',
        'hover:bg-accent/60 transition-colors duration-100 text-left',
        'focus-visible:outline-none focus-visible:bg-accent',
      )}
    >
      <span
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-base',
          config.color,
        )}
        aria-hidden="true"
      >
        {config.icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {expense.description}
        </p>
        <p className="text-xs text-muted-foreground">
          {config.label} · {formatDate(expense.date)}
        </p>
      </div>
      <span
        className={cn(
          'text-sm font-semibold flex-shrink-0 tabular-nums',
          isIncome ? 'text-green-500' : 'text-foreground',
        )}
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {isIncome && !settings.privacyMode ? '+' : ''}{formatCurrency(expense.amount, currencySymbol, settings.privacyMode)}
      </span>
    </button>
  )
}
