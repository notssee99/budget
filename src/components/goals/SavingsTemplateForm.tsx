'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFinanceStore } from '@/store/financeStore'
import type { SavingsTemplate } from '@/types'
import { cn } from '@/lib/utils'

const ICONS = ['🏖️', '💻', '🎮', '🚗', '🏠', '🛫', '💍', '🎓', '🏥', '💰', '🎯', '📱', '🛍️', '🍔', '⚡', '🔧']

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(40),
  icon: z.string().min(1, 'Pick an icon'),
  amount: z.coerce.number().positive('Must be greater than 0'),
  category: z.string().max(30).optional(),
  description: z.string().max(120).optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: SavingsTemplate
}

export function SavingsTemplateForm({ open, onOpenChange, template }: Props) {
  const { addSavingsTemplate, updateSavingsTemplate, savingsTemplates } = useFinanceStore()
  const isEditing = !!template
  const [customCategory, setCustomCategory] = useState('')

  // Collect existing categories
  const existingCategories = Array.from(
    new Set(savingsTemplates.map(t => t.category).filter(Boolean) as string[])
  )

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', icon: '💰', amount: undefined, category: '', description: '' },
  })

  const selectedIcon = watch('icon')
  const selectedCategory = watch('category')

  useEffect(() => {
    if (open) {
      reset(template
        ? { name: template.name, icon: template.icon, amount: template.amount, category: template.category ?? '', description: template.description ?? '' }
        : { name: '', icon: '💰', amount: undefined, category: '', description: '' }
      )
      setCustomCategory('')
    }
  }, [open, template, reset])

  function applyCategory(cat: string) {
    setValue('category', cat, { shouldValidate: true })
  }

  function handleCustomCategoryKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (customCategory.trim()) {
        applyCategory(customCategory.trim())
      }
    }
  }

  function onSubmit(values: FormValues) {
    const data = { ...values, category: values.category?.trim() || undefined }
    if (isEditing && template) {
      updateSavingsTemplate(template.id, data)
      toast.success('Template updated')
    } else {
      addSavingsTemplate(data)
      toast.success('Template saved')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Template' : 'New Savings Template'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update this savings template.' : 'Save a preset to quickly add savings as an expense.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          {/* Icon picker */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setValue('icon', emoji, { shouldValidate: true })}
                  className={cn(
                    'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all border-2 hover:scale-110',
                    selectedIcon === emoji
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 scale-110'
                      : 'border-transparent bg-zinc-100 dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600',
                  )}
                  aria-label={emoji}
                  aria-pressed={selectedIcon === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {errors.icon && <p className="text-xs text-red-500">{errors.icon.message}</p>}
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl-name">Name</Label>
            <Input id="tpl-name" placeholder="e.g. Emergency Fund" {...register('name')} className={errors.name ? 'border-red-400' : ''} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl-amount">Default amount</Label>
            <Input id="tpl-amount" type="number" min="0.01" step="0.01" placeholder="0.00" {...register('amount')} className={errors.amount ? 'border-red-400' : ''} />
            {errors.amount && <p className="text-xs text-red-500">{errors.amount.message}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category <span className="text-zinc-400 font-normal">(optional)</span></Label>

            {/* Existing category chips */}
            {existingCategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {existingCategories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => applyCategory(selectedCategory === cat ? '' : cat)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-indigo-400'
                    )}
                  >
                    {cat}
                  </button>
                ))}
                {selectedCategory && (
                  <button
                    type="button"
                    onClick={() => applyCategory('')}
                    className="px-2 py-1 rounded-full text-xs text-zinc-400 hover:text-zinc-600 flex items-center gap-0.5"
                  >
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            )}

            {/* Custom category input */}
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Trips, Emergency, Monthly"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                onKeyDown={handleCustomCategoryKeyDown}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!customCategory.trim()}
                onClick={() => {
                  if (customCategory.trim()) {
                    applyCategory(customCategory.trim())
                    setCustomCategory('')
                  }
                }}
              >
                Set
              </Button>
            </div>
            {selectedCategory && (
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Category: <strong>{selectedCategory}</strong>
              </p>
            )}
            {/* Hidden input to register category in form */}
            <input type="hidden" {...register('category')} />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="tpl-desc">Description <span className="text-zinc-400 font-normal">(optional)</span></Label>
            <Input id="tpl-desc" placeholder="Short note" {...register('description')} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isEditing ? 'Save changes' : 'Save Template'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
