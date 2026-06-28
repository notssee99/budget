'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinanceStore } from '@/store/financeStore'
import { parseQuickInput } from '@/lib/quickParse'
import { CATEGORY_CONFIG } from '@/lib/categoryDetection'
import { formatCurrency } from '@/lib/calculations'
import { cn } from '@/lib/utils'

interface QuickAddProps {
  onClose?: () => void
}

type Status = 'idle' | 'success' | 'error'

export function QuickAdd({ onClose }: QuickAddProps) {
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addExpense, settings } = useFinanceStore()

  const parsed = value.trim() ? parseQuickInput(value) : null
  const hasContent = value.trim().length > 0
  const isInvalid = hasContent && !parsed

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!parsed || isSubmitting) return

    setIsSubmitting(true)
    // Minimal delay to let state settle, then add
    await new Promise(r => setTimeout(r, 80))

    addExpense({
      amount: parsed.amount,
      description: parsed.description,
      category: parsed.category,
      type: parsed.type,
      date: new Date().toISOString().slice(0, 10),
    })

    setStatus('success')
    setIsSubmitting(false)
    setValue('')

    setTimeout(() => {
      setStatus('idle')
      onClose?.()
    }, 900)
  }, [parsed, isSubmitting, addExpense, onClose])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      onClose?.()
    }
  }

  const categoryConfig = parsed ? CATEGORY_CONFIG[parsed.category] : null
  const typeLabel =
    parsed?.type === 'income'
      ? 'income'
      : parsed?.type === 'savings'
        ? 'savings'
        : 'expense'

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Input row */}
      <div
        className={cn(
          'relative flex items-center gap-2 rounded-2xl px-4 py-2.5',
          'bg-card border transition-all duration-200',
          'shadow-sm',
          isInvalid
            ? 'border-destructive/50 shadow-destructive/10'
            : status === 'success'
              ? 'border-green-500/50 shadow-green-500/10'
              : 'border-border focus-within:border-primary/50 focus-within:shadow-primary/10',
          'focus-within:shadow-md',
        )}
        style={{
          background: status === 'success'
            ? undefined
            : 'linear-gradient(var(--angle, 0deg), hsl(var(--card)), hsl(var(--card)))',
        }}
      >
        {/* Gradient border shimmer on focus — via outline pseudo-layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 focus-within:opacity-100"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary)/0.3), hsl(243 90% 75%/0.2), hsl(var(--primary)/0.1))',
            padding: '1px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
          }}
        />

        {/* Category icon — appears when parsed */}
        <AnimatePresence>
          {categoryConfig && (
            <motion.span
              key={parsed?.category}
              initial={{ opacity: 0, scale: 0.5, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex-shrink-0 text-xl leading-none"
              role="img"
              aria-label={categoryConfig.label}
            >
              {categoryConfig.icon}
            </motion.span>
          )}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => {
            setValue(e.target.value)
            setStatus('idle')
          }}
          onKeyDown={handleKeyDown}
          placeholder='Quick add… e.g. "Coffee 2.5" or "Salary 1734"'
          className={cn(
            'flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground',
            'outline-none border-none ring-0 min-w-0',
          )}
          aria-label="Quick add transaction"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Keyboard hint */}
        {!hasContent && (
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono flex-shrink-0">
            Q
          </kbd>
        )}

        {/* Submit button */}
        <AnimatePresence>
          {hasContent && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.12 }}
              onClick={handleSubmit}
              disabled={!parsed || isSubmitting}
              className={cn(
                'flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-xl',
                'transition-all duration-150',
                parsed && !isSubmitting
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-muted text-muted-foreground cursor-not-allowed',
              )}
              aria-label="Add transaction"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Preview / feedback row */}
      <AnimatePresence mode="wait">
        {status === 'success' && (
          <motion.p
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-2 px-4 text-xs text-green-600 dark:text-green-400 font-medium"
          >
            ✓ Added successfully
          </motion.p>
        )}

        {status !== 'success' && parsed && (
          <motion.p
            key="preview"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-2 px-4 text-xs text-muted-foreground"
          >
            Adding:{' '}
            <span className="font-medium text-foreground">
              {categoryConfig?.icon} {parsed.description}
            </span>
            {' — '}
            <span className="font-medium text-foreground" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(parsed.amount, settings.currencySymbol, settings.privacyMode)}
            </span>
            {' '}
            <span className="text-muted-foreground">({typeLabel})</span>
          </motion.p>
        )}

        {status !== 'success' && isInvalid && (
          <motion.p
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-2 px-4 text-xs text-destructive"
          >
            Could not parse amount — try "Coffee 3.50" or "45 Fuel"
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
