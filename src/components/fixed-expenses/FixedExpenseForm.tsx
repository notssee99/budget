'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { FixedExpense, Category } from '@/types'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'bills', label: 'Bills' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'transport', label: 'Transport' },
  { value: 'health', label: 'Health' },
  { value: 'groceries', label: 'Groceries' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'family', label: 'Family' },
  { value: 'other', label: 'Other' },
]

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<FixedExpense, 'id' | 'budgetMonthId' | 'isPaid' | 'paidDate'>) => void
  initial?: FixedExpense | null
  showAssign?: boolean
}

export function FixedExpenseForm({ open, onClose, onSave, initial, showAssign }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '')
  const [dueDay, setDueDay] = useState(initial?.dueDay?.toString() ?? '1')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'bills')
  const [assignedTo, setAssignedTo] = useState<'festoni' | 'odeta' | ''>(initial?.assignedTo ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !amount) return
    onSave({
      name: name.trim(),
      amount: parseFloat(amount),
      dueDay: parseInt(dueDay, 10),
      category,
      assignedTo: assignedTo || undefined,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? 'Ndrysho shpenzimin' : 'Shto shpenzim fiks'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="fe-name">Emri</Label>
            <Input
              id="fe-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="p.sh. Qiraja, Netflix..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fe-amount">Shuma (€)</Label>
              <Input
                id="fe-amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fe-day">Dita e pagesës</Label>
              <Input
                id="fe-day"
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={e => setDueDay(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Kategoria</Label>
            <Select value={category} onValueChange={v => setCategory(v as Category)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showAssign && (
            <div className="space-y-1.5">
              <Label>Caktuar për</Label>
              <Select value={assignedTo} onValueChange={v => setAssignedTo(v as 'festoni' | 'odeta' | '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Zgjidhni..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="festoni">👨 Festoni</SelectItem>
                  <SelectItem value="odeta">👩 Odeta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Anulo
            </Button>
            <Button type="submit" className="flex-1">
              {initial ? 'Ruaj' : 'Shto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
