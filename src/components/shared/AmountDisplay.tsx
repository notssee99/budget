'use client'

import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/calculations'
import { useFinanceStore } from '@/store/financeStore'

interface AmountDisplayProps {
  amount: number
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  colored?: boolean
  prefix?: string
}

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl font-semibold',
  xl: 'text-3xl font-bold tracking-tight',
} as const

export function AmountDisplay({
  amount,
  className,
  size = 'md',
  colored = false,
  prefix,
}: AmountDisplayProps) {
  const { settings } = useFinanceStore()
  const { privacyMode, currencySymbol } = settings

  const colorClass = colored
    ? amount >= 0
      ? 'text-green-500'
      : 'text-red-500'
    : ''

  if (privacyMode) {
    return (
      <span
        className={cn(
          SIZE_CLASSES[size],
          colorClass,
          'font-variant-numeric tabular-nums select-none tracking-widest',
          className,
        )}
      >
        {prefix ? `${prefix} ` : ''}••••••
      </span>
    )
  }

  const formatted = formatCurrency(amount, currencySymbol)

  return (
    <span
      className={cn(
        SIZE_CLASSES[size],
        colorClass,
        'font-variant-numeric tabular-nums',
        className,
      )}
      style={{ fontVariantNumeric: 'tabular-nums' }}
    >
      {prefix ? `${prefix} ` : ''}
      {formatted}
    </span>
  )
}
