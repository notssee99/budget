'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSharedStore } from '@/store/sharedStore'
import type { SharedSavingsGoal } from '@/types'
import { cn } from '@/lib/utils'

const ICONS = ['🏖️', '🚗', '🏠', '🛫', '💍', '🎓', '🏥', '💰', '🎯', '🛒', '🎉', '🏔️', '⛵', '🍕', '🎸']

const schema = z.object({
  name: z.string().min(1, 'Emri është i detyrueshëm').max(40),
  targetAmount: z.coerce.number().positive('Duhet të jetë më shumë se 0'),
  description: z.string().max(120).optional(),
  icon: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  goal?: SharedSavingsGoal
}

export function SharedGoalForm({ open, onOpenChange, goal }: Props) {
  const { addGoal, updateGoal } = useSharedStore()
  const isEditing = !!goal

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', targetAmount: undefined, description: '', icon: '🎯' },
  })

  const selectedIcon = watch('icon')

  useEffect(() => {
    if (open) {
      reset(goal
        ? { name: goal.name, targetAmount: goal.targetAmount, description: goal.description ?? '', icon: goal.icon }
        : { name: '', targetAmount: undefined, description: '', icon: '🎯' }
      )
    }
  }, [open, goal, reset])

  function onSubmit(values: FormValues) {
    if (isEditing && goal) {
      updateGoal(goal.id, { name: values.name, targetAmount: values.targetAmount, description: values.description, icon: values.icon })
      toast.success('Qëllimi u përditësua')
    } else {
      addGoal({ name: values.name, targetAmount: values.targetAmount, description: values.description, icon: values.icon })
      toast.success('Qëllimi u krijua')
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Ndrysho qëllimin' : 'Qëllim i ri i përbashkët'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-1">
          <div className="space-y-2">
            <Label>Ikona</Label>
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
                      : 'border-transparent bg-zinc-100 dark:bg-zinc-800',
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sh-name">Emri</Label>
            <Input id="sh-name" placeholder="p.sh. Pushime në Greqi" {...register('name')} className={errors.name ? 'border-red-400' : ''} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sh-target">Shuma e synuar</Label>
            <Input id="sh-target" type="number" min="1" step="0.01" placeholder="0.00" {...register('targetAmount')} className={errors.targetAmount ? 'border-red-400' : ''} />
            {errors.targetAmount && <p className="text-xs text-red-500">{errors.targetAmount.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sh-desc">Përshkrim <span className="text-zinc-400 font-normal">(opsional)</span></Label>
            <Input id="sh-desc" placeholder="Shënim i shkurtër..." {...register('description')} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Anulo</Button>
            <Button type="submit" className="flex-1">{isEditing ? 'Ruaj' : 'Krijo'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
