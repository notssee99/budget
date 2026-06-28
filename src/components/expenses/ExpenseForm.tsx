'use client'

import { useEffect, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { CalendarIcon, StickyNote, DollarSign, AlignLeft, Tag } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { CategoryBadge } from '@/components/shared/CategoryBadge'

import { useFinanceStore } from '@/store/financeStore'
import { CATEGORY_CONFIG, detectCategory, detectType } from '@/lib/categoryDetection'
import { cn } from '@/lib/utils'
import type { Expense, Category, TransactionType } from '@/types'

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const schema = z.object({
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required') as z.ZodType<Category>,
  type: z.enum(['expense', 'income', 'savings']) as z.ZodType<TransactionType>,
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExpenseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense
}

// ---------------------------------------------------------------------------
// Type tabs config
// ---------------------------------------------------------------------------

const TYPE_TABS: { value: TransactionType; label: string; color: string; activeClass: string }[] = [
  {
    value: 'expense',
    label: 'Expense',
    color: 'text-rose-600 dark:text-rose-400',
    activeClass: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300',
  },
  {
    value: 'income',
    label: 'Income',
    color: 'text-emerald-600 dark:text-emerald-400',
    activeClass: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300',
  },
  {
    value: 'savings',
    label: 'Savings',
    color: 'text-indigo-600 dark:text-indigo-400',
    activeClass: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExpenseForm({ open, onOpenChange, expense }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useFinanceStore()
  const isEditing = !!expense

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      amount: '',
      description: '',
      category: 'other',
      type: 'expense',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (open && expense) {
      reset({
        amount: String(expense.amount),
        description: expense.description,
        category: expense.category,
        type: expense.type,
        date: expense.date,
        notes: expense.notes ?? '',
      })
    } else if (open && !expense) {
      reset({
        amount: '',
        description: '',
        category: 'other',
        type: 'expense',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      })
    }
  }, [open, expense, reset])

  // Watch description for auto-detection
  const description = watch('description')
  const currentCategory = watch('category')
  const currentType = watch('type')

  // Debounced auto-detect
  useEffect(() => {
    if (!description || isEditing) return
    const timer = setTimeout(() => {
      const detected = detectCategory(description)
      setValue('category', detected, { shouldValidate: false })
      const amount = parseFloat(watch('amount')) || 0
      const detectedType = detectType(description, amount)
      setValue('type', detectedType, { shouldValidate: false })
    }, 350)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description, isEditing])

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const payload = {
        amount: parseFloat(values.amount),
        description: values.description.trim(),
        category: values.category,
        type: values.type,
        date: values.date,
        notes: values.notes?.trim() || undefined,
      }

      if (isEditing && expense) {
        updateExpense(expense.id, payload)
        toast.success('Transaction updated')
      } else {
        addExpense(payload)
        toast.success('Transaction added', {
          description: `${values.description} — ${values.amount}`,
        })
      }

      onOpenChange(false)
    },
    [isEditing, expense, addExpense, updateExpense, onOpenChange],
  )

  const categories = Object.entries(CATEGORY_CONFIG) as [Category, typeof CATEGORY_CONFIG[Category]][]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            {isEditing ? 'Edit transaction' : 'New transaction'}
          </DialogTitle>
        </DialogHeader>

        <Separator />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-6 py-5 space-y-5">

            {/* Type tabs */}
            <div>
              <div className="flex gap-1.5 p-1 bg-muted rounded-lg">
                {TYPE_TABS.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setValue('type', tab.value, { shouldValidate: false })}
                    className={cn(
                      'flex-1 py-1.5 text-sm font-medium rounded-md border transition-all duration-150',
                      currentType === tab.value
                        ? tab.activeClass
                        : 'border-transparent text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Amount
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className={cn(
                    'pl-9 text-base font-semibold tabular-nums',
                    errors.amount && 'border-destructive focus-visible:ring-destructive',
                  )}
                  {...register('amount')}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            {/* Description + auto-detected category preview */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description
              </Label>
              <div className="relative">
                <AlignLeft className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="description"
                  placeholder="e.g. Starbucks, Netflix, Lidl…"
                  className={cn(
                    'pl-9',
                    errors.description && 'border-destructive focus-visible:ring-destructive',
                  )}
                  {...register('description')}
                />
              </div>
              {description && !isEditing && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Detected:</span>
                  <CategoryBadge category={currentCategory} />
                </div>
              )}
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category + Date row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Category */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Category
                </Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn(errors.category && 'border-destructive')}>
                        <Tag className="w-3.5 h-3.5 text-muted-foreground mr-1 flex-shrink-0" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {categories.map(([key, cfg]) => (
                          <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <span>{cfg.icon}</span>
                              <span>{cfg.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Date
                </Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    id="date"
                    type="date"
                    className={cn(
                      'pl-9',
                      errors.date && 'border-destructive focus-visible:ring-destructive',
                    )}
                    {...register('date')}
                  />
                </div>
                {errors.date && (
                  <p className="text-xs text-destructive">{errors.date.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
                Notes
                <span className="font-normal normal-case">(optional)</span>
              </Label>
              <div className="relative">
                <StickyNote className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Textarea
                  id="notes"
                  rows={2}
                  placeholder="Any extra detail…"
                  className="pl-9 resize-none text-sm"
                  {...register('notes')}
                />
              </div>
            </div>
          </div>

          <Separator />

          <DialogFooter className="px-6 py-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isEditing ? 'Save changes' : 'Add transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
