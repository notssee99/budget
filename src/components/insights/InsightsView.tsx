'use client'

import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Trophy,
  Clock,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFinanceStore } from '@/store/financeStore'
import { getInsights } from '@/lib/calculations'
import type { Insight } from '@/types'
import { cn } from '@/lib/utils'

function InsightIcon({ type, className }: { type: Insight['type']; className?: string }) {
  const base = cn('w-5 h-5 flex-shrink-0', className)
  switch (type) {
    case 'increase': return <TrendingUp className={cn(base, 'text-red-500')} />
    case 'decrease': return <TrendingDown className={cn(base, 'text-green-500')} />
    case 'warning':  return <AlertTriangle className={cn(base, 'text-amber-500')} />
    case 'achievement': return <Trophy className={cn(base, 'text-yellow-500')} />
    case 'projection': return <Clock className={cn(base, 'text-indigo-500')} />
    default: return <Lightbulb className={cn(base, 'text-blue-500')} />
  }
}

const TYPE_STYLES: Record<string, { bg: string; ring: string; badge: string }> = {
  increase:    { bg: 'bg-red-50 dark:bg-red-950/20',    ring: 'ring-red-200/60 dark:ring-red-800/40',    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  decrease:    { bg: 'bg-green-50 dark:bg-green-950/20', ring: 'ring-green-200/60 dark:ring-green-800/40', badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  warning:     { bg: 'bg-amber-50 dark:bg-amber-950/20', ring: 'ring-amber-200/60 dark:ring-amber-800/40', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  achievement: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', ring: 'ring-yellow-200/60 dark:ring-yellow-800/40', badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  projection:  { bg: 'bg-indigo-50 dark:bg-indigo-950/20', ring: 'ring-indigo-200/60 dark:ring-indigo-800/40', badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  tip:         { bg: 'bg-blue-50 dark:bg-blue-950/20',   ring: 'ring-blue-200/60 dark:ring-blue-800/40',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const style = TYPE_STYLES[insight.type] ?? TYPE_STYLES.tip
  const hasChange = insight.percentChange !== undefined && !isNaN(insight.percentChange)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.06 }}
    >
      <Card className={cn('ring-1 transition-shadow hover:shadow-md', style.bg, style.ring)}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon + emoji */}
            <div className="flex flex-col items-center gap-1 mt-0.5">
              <InsightIcon type={insight.type} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-base leading-none">{insight.icon}</span>
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex-1">
                  {insight.title}
                </h3>
                {insight.priority === 'high' && (
                  <Badge className={cn('text-[10px] px-1.5 py-0.5 font-medium', style.badge)}>
                    {PRIORITY_LABELS[insight.priority]}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {insight.description}
              </p>
              {hasChange && (
                <div className="mt-2">
                  <span className={cn(
                    'text-xs font-semibold tabular-nums px-2 py-0.5 rounded-full',
                    (insight.percentChange ?? 0) > 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
                  )}>
                    {(insight.percentChange ?? 0) > 0 ? '+' : ''}{Math.round(insight.percentChange ?? 0)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function InsightsView() {
  const { currentMonth, months, expenses, settings } = useFinanceStore()

  const insights = getInsights({ currentMonth, months, expenses, settings })

  const highPriority = insights.filter(i => i.priority === 'high')
  const rest = insights.filter(i => i.priority !== 'high')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Insights</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Patterns and observations from your spending data
        </p>
      </div>

      {insights.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            No insights yet
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs">
            Add some expenses and we'll start surfacing patterns, warnings, and achievements here.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* High priority section */}
          {highPriority.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Needs attention
              </h2>
              <div className="space-y-3">
                {highPriority.map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div className="space-y-3">
              {highPriority.length > 0 && (
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  More insights
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rest.map((insight, i) => (
                  <InsightCard key={insight.id} insight={insight} index={highPriority.length + i} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
