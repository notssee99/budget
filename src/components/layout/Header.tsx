'use client'

import { usePathname } from 'next/navigation'
import { Plus, LogOut } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useAuthStore } from '@/store/authStore'
import { PrivacyToggle } from '@/components/shared/PrivacyToggle'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { GlobalSearch } from '@/components/shared/GlobalSearch'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/expenses': 'Expenses',
  '/goals': 'Goals',
  '/statistics': 'Statistics',
  '/calendar': 'Calendar',
  '/reports': 'Reports',
  '/insights': 'Insights',
  '/settings': 'Settings',
}

interface HeaderProps {
  onQuickAdd?: () => void
}

export function Header({ onQuickAdd }: HeaderProps) {
  const pathname = usePathname()
  const { settings } = useFinanceStore()
  const { user, logout } = useAuthStore()
  const title = PAGE_TITLES[pathname] ?? 'BudgetApp'
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 overflow-hidden border-b border-border bg-card/80 px-4 backdrop-blur-sm lg:gap-4 lg:px-6">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
        <span className="hidden sm:block text-xs text-muted-foreground bg-muted rounded-md px-2 py-1">{dateStr}</span>
      </div>

      {/* Right */}
      <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
        <NotificationBell />
        <PrivacyToggle />
        <ThemeToggle />
        <button
          onClick={onQuickAdd}
          className="hidden h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:flex"
          aria-label="Quick add"
        >
          <Plus size={14} strokeWidth={2.5} />
          <span className="hidden sm:inline">Quick Add</span>
        </button>
        <GlobalSearch />

        {/* User badge + logout */}
        {user && (
          <div className="flex items-center gap-1 ml-1">
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground">
              <span>{user.avatar}</span>
              <span>{user.name}</span>
            </div>
            <button
              onClick={logout}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
