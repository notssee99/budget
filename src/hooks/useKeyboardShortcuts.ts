'use client'

import { useEffect } from 'react'

interface UseKeyboardShortcutsProps {
  onOpenSearch?: () => void
  onOpenQuickAdd?: () => void
  onNewExpense?: () => void
}

export function useKeyboardShortcuts({
  onOpenSearch,
  onOpenQuickAdd,
  onNewExpense,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
      const isInInput =
        tag === 'input' ||
        tag === 'textarea' ||
        tag === 'select' ||
        (e.target as HTMLElement)?.isContentEditable

      // Cmd/Ctrl + K: open global search (works even in inputs)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenSearch?.()
        return
      }

      // Escape: close modals (delegate to DOM — fires a bubbling keydown)
      // Native Radix dialogs handle Escape themselves; nothing to do here
      // unless the caller wants explicit handling.
      if (e.key === 'Escape') {
        // No default prevention — let Radix/browser handle it naturally
        return
      }

      // The shortcuts below must not fire while the user is typing
      if (isInInput) return

      // Q: open quick add
      if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault()
        onOpenQuickAdd?.()
        return
      }

      // N: new expense
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        onNewExpense?.()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onOpenSearch, onOpenQuickAdd, onNewExpense])
}
