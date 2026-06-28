'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home, Receipt, Target, BarChart2,
  Calendar, FileText, Lightbulb, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { PrivacyToggle } from '@/components/shared/PrivacyToggle'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useFinanceStore } from '@/store/financeStore'
import { formatCurrency } from '@/lib/calculations'

const NAV = [
  { label: 'Dashboard',  icon: Home,       href: '/' },
  { label: 'Expenses',   icon: Receipt,    href: '/expenses' },
  { label: 'Goals',      icon: Target,     href: '/goals' },
  { label: 'Statistics', icon: BarChart2,  href: '/statistics' },
  { label: 'Calendar',   icon: Calendar,   href: '/calendar' },
  { label: 'Reports',    icon: FileText,   href: '/reports' },
  { label: 'Insights',   icon: Lightbulb,  href: '/insights' },
  { label: 'Settings',   icon: Settings,   href: '/settings' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { currentMonth, expenses, settings } = useFinanceStore()

  const spent = expenses
    .filter(e => e.budgetMonthId === currentMonth?.id && e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0)
  const available = currentMonth ? currentMonth.income - spent : 0

  return (
    <aside className="flex flex-col h-full w-60 bg-card border-r border-border">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-border shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
          💰
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">BudgetApp</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Personal finance</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} className="shrink-0" />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-border p-3 space-y-3">
        {currentMonth && (
          <div className="rounded-lg bg-muted px-3 py-2.5">
            <p className="text-[11px] text-muted-foreground mb-1">Available this month</p>
            <p className={cn('text-sm font-bold tabular-nums', available < 0 ? 'text-destructive' : 'text-foreground')}>
              {settings.privacyMode ? '••••' : formatCurrency(available, settings.currencySymbol)}
            </p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <PrivacyToggle />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}
