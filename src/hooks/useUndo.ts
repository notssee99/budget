'use client'

import { useEffect, useRef } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import { toast } from 'sonner'
import type { Expense } from '@/types'

interface UseUndoReturn {
  canUndo: boolean
  undo: () => void
  lastDeleted: Expense | null
}

export function useUndo(): UseUndoReturn {
  const lastDeletedExpense = useFinanceStore(s => s.lastDeletedExpense)
  const undoDeleteExpense = useFinanceStore(s => s.undoDeleteExpense)

  // Track the previous value so we only fire the toast on new deletions
  const prevDeletedRef = useRef<Expense | null>(null)
  // Keep a stable ref to undoDeleteExpense for use inside the toast action
  const undoRef = useRef(undoDeleteExpense)
  useEffect(() => {
    undoRef.current = undoDeleteExpense
  }, [undoDeleteExpense])

  useEffect(() => {
    if (
      lastDeletedExpense &&
      lastDeletedExpense.id !== prevDeletedRef.current?.id
    ) {
      prevDeletedRef.current = lastDeletedExpense

      toast(`Deleted "${lastDeletedExpense.description}"`, {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: () => undoRef.current(),
        },
      })
    }
  }, [lastDeletedExpense])

  return {
    canUndo: lastDeletedExpense !== null,
    undo: undoDeleteExpense,
    lastDeleted: lastDeletedExpense,
  }
}
