'use client'

import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const COLOR_MAP = {
  default: {
    ring: 'bg-muted',
    icon: 'text-muted-foreground',
  },
  primary: {
    ring: 'bg-primary/10',
    icon: 'text-primary',
  },
  success: {
    ring: 'bg-emerald-50 dark:bg-emerald-950/40',
    icon: 'text-emerald-600 dark:text-emerald-400',
  },
  warning: {
    ring: 'bg-amber-50 dark:bg-amber-950/40',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  danger: {
    ring: 'bg-rose-50 dark:bg-rose-950/40',
    icon: 'text-rose-600 dark:text-rose-400',
  },
} as const

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  trend?: number
  className?: string
  color?: keyof typeof COLOR_MAP
  children?: ReactNode
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  color = 'default',
  children,
}: StatCardProps) {
  const colors = COLOR_MAP[color]

  return (
    <Card className={cn('overflow-hidden transition-shadow hover:shadow-md', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </p>
            <p
              className="mt-1.5 truncate text-2xl font-bold tracking-tight text-foreground"
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {value}
            </p>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
            {typeof trend === 'number' && (
              <div
                className={cn(
                  'mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                  trend >= 0
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400',
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              colors.ring,
            )}
          >
            <span className={cn('h-5 w-5', colors.icon)}>{icon}</span>
          </div>
        </div>
        {children && <div className="mt-4">{children}</div>}
      </CardContent>
    </Card>
  )
}
