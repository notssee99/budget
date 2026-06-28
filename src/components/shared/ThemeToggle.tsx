'use client'

import { useEffect } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinanceStore } from '@/store/financeStore'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark' | 'system'

const THEMES: Theme[] = ['light', 'dark', 'system']

const THEME_META: Record<Theme, { icon: React.ReactNode; label: string }> = {
  light: { icon: <Sun className="w-4 h-4" />, label: 'Light mode' },
  dark: { icon: <Moon className="w-4 h-4" />, label: 'Dark mode' },
  system: { icon: <Monitor className="w-4 h-4" />, label: 'System theme' },
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
}

export function ThemeToggle({ className }: { className?: string }) {
  const { settings, updateSettings } = useFinanceStore()
  const theme = settings.theme

  // Apply theme on mount and whenever it changes
  useEffect(() => {
    applyTheme(theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  function cycleTheme() {
    const idx = THEMES.indexOf(theme)
    const next = THEMES[(idx + 1) % THEMES.length]
    updateSettings({ theme: next })
  }

  const meta = THEME_META[theme]

  return (
    <button
      onClick={cycleTheme}
      aria-label={meta.label}
      title={meta.label}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg',
        'text-muted-foreground hover:text-foreground hover:bg-accent',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {meta.icon}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
