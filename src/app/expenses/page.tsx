'use client'

import { AppLayout } from '@/components/layout'
import { ExpensesView } from '@/components/expenses'

export default function ExpensesPage() {
  return (
    <AppLayout>
      <ExpensesView />
    </AppLayout>
  )
}
