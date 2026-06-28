'use client'

import { Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFinanceStore } from '@/store/financeStore'
import { cn } from '@/lib/utils'

export function PrivacyToggle({ className }: { className?: string }) {
  const { settings, updateSettings } = useFinanceStore()
  const { privacyMode } = settings

  function toggle() {
    updateSettings({ privacyMode: !privacyMode })
  }

  return (
    <button
      onClick={toggle}
      aria-label={privacyMode ? 'Show amounts' : 'Hide amounts'}
      title={privacyMode ? 'Show amounts' : 'Hide amounts'}
      aria-pressed={privacyMode}
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg',
        'transition-colors duration-150',
        privacyMode
          ? 'text-primary bg-accent'
          : 'text-muted-foreground hover:text-foreground hover:bg-accent',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={privacyMode ? 'off' : 'on'}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {privacyMode ? (
            <EyeOff className="w-4 h-4" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
