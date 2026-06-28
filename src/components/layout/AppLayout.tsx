'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useAuthStore } from '@/store/authStore'
import { Toaster } from 'sonner'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { QuickAdd } from '@/components/shared/QuickAdd'
import { LoginScreen } from '@/components/auth'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { settings, reloadForUser } = useFinanceStore()
  const { user, isLoading, init } = useAuthStore()
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  // Init auth from sessionStorage on mount
  useEffect(() => {
    init()
  }, [init])

  // Whenever user changes (login or page refresh), load their data
  useEffect(() => {
    if (user) {
      reloadForUser(user.id)
    }
  }, [user?.id])

  // Apply theme
  useEffect(() => {
    const root = document.documentElement
    const apply = (theme: string) => {
      root.classList.remove('light', 'dark')
      if (theme === 'system') {
        root.classList.add(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      } else {
        root.classList.add(theme)
      }
    }
    apply(settings.theme)
    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const h = () => apply('system')
      mq.addEventListener('change', h)
      return () => mq.removeEventListener('change', h)
    }
  }, [settings.theme])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickAddOpen(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <LoginScreen />
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar — hidden on mobile, visible on desktop */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Main column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onQuickAdd={() => setQuickAddOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />

      {/* Floating Add button — mobile only */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setQuickAddOpen(true)}
        className="lg:hidden fixed bottom-20 right-4 z-40 h-14 w-14 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Quick add"
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>

      {quickAddOpen && <QuickAdd onClose={() => setQuickAddOpen(false)} />}
      <Toaster richColors position="top-right" />
    </div>
  )
}
