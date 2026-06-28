'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSharedStore } from '@/store/sharedStore'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Toaster } from 'sonner'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { MobileNav } from './MobileNav'
import { QuickAdd } from '@/components/shared/QuickAdd'
import { LoginScreen } from '@/components/auth'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { settings, loadForUser, isLoaded } = useFinanceStore()
  const { loadShared } = useSharedStore()
  const { user, isLoading, init } = useAuthStore()
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  useEffect(() => { init() }, [init])

  // Load user data + shared data when user logs in or page refreshes
  useEffect(() => {
    if (user) {
      loadForUser(user.id)
      loadShared()
    }
  }, [user?.id])

  // Real-time subscriptions — reload when other user changes data
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel('db-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        loadForUser(user.id)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'budget_months' }, () => {
        loadForUser(user.id)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fixed_expenses' }, () => {
        loadForUser(user.id)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, () => {
        loadForUser(user.id)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_savings_goals' }, () => {
        loadShared()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_contributions' }, () => {
        loadShared()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
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
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setQuickAddOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Auth loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!user) return <LoginScreen />

  // Data loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground">Duke ngarkuar të dhënat...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header onQuickAdd={() => setQuickAddOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />

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
