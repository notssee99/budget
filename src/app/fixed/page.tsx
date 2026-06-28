'use client'

import { AppLayout } from '@/components/layout'
import { FixedExpensesView } from '@/components/fixed-expenses/FixedExpensesView'

export default function FixedPage() {
  return (
    <AppLayout>
      <FixedExpensesView />
    </AppLayout>
  )
}
