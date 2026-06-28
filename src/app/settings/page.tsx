'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { AppLayout } from '@/components/layout'
import { useFinanceStore } from '@/store/financeStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface SettingsFormValues {
  userName: string
  salary: number
  weeklyBudget: number
  salaryDay: number
  currencySymbol: string
  currency: string
  theme: 'light' | 'dark' | 'system'
  privacyMode: boolean
  notifWeeklyBudget80: boolean
  notifWeeklyBudget90: boolean
  notifWeeklyBudget100: boolean
  notifBillDue: boolean
  notifSalaryExpected: boolean
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Section({ title, description, children }: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </section>
  )
}

function Field({ label, error, children }: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

function TextInput({ error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2 text-sm bg-background text-foreground placeholder:text-muted-foreground
        focus:outline-none focus:ring-2 focus:ring-ring transition-colors
        ${error ? 'border-destructive' : 'border-input'}`}
    />
  )
}

function Toggle({ checked, onChange, label }: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
          transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
      <span className="sr-only">{label}</span>
    </button>
  )
}

function ToggleRow({ label, description, checked, onChange }: {
  label: string
  description?: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function SettingsPage() {
  const { settings, updateSettings, exportData, importData } = useFinanceStore()
  const [confirmClear, setConfirmClear] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const defaultValues: SettingsFormValues = {
    userName: settings.userName ?? '',
    salary: settings.salary,
    weeklyBudget: settings.weeklyBudget,
    salaryDay: settings.salaryDay,
    currencySymbol: settings.currencySymbol,
    currency: settings.currency,
    theme: settings.theme,
    privacyMode: settings.privacyMode,
    notifWeeklyBudget80: settings.notifications.weeklyBudget80,
    notifWeeklyBudget90: settings.notifications.weeklyBudget90,
    notifWeeklyBudget100: settings.notifications.weeklyBudget100,
    notifBillDue: settings.notifications.billDue,
    notifSalaryExpected: settings.notifications.salaryExpected,
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<SettingsFormValues>({ defaultValues })

  useEffect(() => {
    reset({
      userName: settings.userName ?? '',
      salary: settings.salary,
      weeklyBudget: settings.weeklyBudget,
      salaryDay: settings.salaryDay,
      currencySymbol: settings.currencySymbol,
      currency: settings.currency,
      theme: settings.theme,
      privacyMode: settings.privacyMode,
      notifWeeklyBudget80: settings.notifications.weeklyBudget80,
      notifWeeklyBudget90: settings.notifications.weeklyBudget90,
      notifWeeklyBudget100: settings.notifications.weeklyBudget100,
      notifBillDue: settings.notifications.billDue,
      notifSalaryExpected: settings.notifications.salaryExpected,
    })
  }, [settings, reset])

  const onSubmit = useCallback((values: SettingsFormValues) => {
    updateSettings({
      userName: values.userName,
      salary: Number(values.salary),
      weeklyBudget: Number(values.weeklyBudget),
      salaryDay: Number(values.salaryDay),
      currencySymbol: values.currencySymbol,
      currency: values.currency,
      theme: values.theme,
      privacyMode: values.privacyMode,
      notifications: {
        weeklyBudget80: values.notifWeeklyBudget80,
        weeklyBudget90: values.notifWeeklyBudget90,
        weeklyBudget100: values.notifWeeklyBudget100,
        billDue: values.notifBillDue,
        salaryExpected: values.notifSalaryExpected,
      },
    })

    // Apply theme immediately
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    if (values.theme === 'light') root.classList.add('light')
    else if (values.theme === 'dark') root.classList.add('dark')
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) root.classList.add('dark')

    toast.success('Settings saved')
  }, [updateSettings])

  // Watched values for controlled fields
  const privacyMode = watch('privacyMode')
  const theme = watch('theme')
  const notifWeeklyBudget80 = watch('notifWeeklyBudget80')
  const notifWeeklyBudget90 = watch('notifWeeklyBudget90')
  const notifWeeklyBudget100 = watch('notifWeeklyBudget100')
  const notifBillDue = watch('notifBillDue')
  const notifSalaryExpected = watch('notifSalaryExpected')

  // Export
  const handleExport = useCallback(() => {
    try {
      const json = exportData()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `budgetapp-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Backup exported')
    } catch {
      toast.error('Export failed')
    }
  }, [exportData])

  // Import
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const success = importData(text)
      if (success) toast.success('Data imported successfully')
      else toast.error('Import failed — invalid file format')
      e.target.value = ''
    }
    reader.readAsText(file)
  }, [importData])

  // Clear all data
  const handleClearData = useCallback(() => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 4000)
      return
    }
    localStorage.removeItem('finance-store')
    toast.success('All data cleared — reloading…')
    setTimeout(() => window.location.reload(), 1200)
  }, [confirmClear])

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your profile, budget, and preferences.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

          {/* 1. Profile */}
          <Section title="Profile" description="How you appear in the app.">
            <Field label="Your name" error={errors.userName?.message}>
              <TextInput
                {...register('userName', { maxLength: { value: 60, message: 'Name too long' } })}
                placeholder="e.g. Alex"
                error={errors.userName?.message}
              />
            </Field>
          </Section>

          {/* 2. Budget */}
          <Section title="Budget" description="Your monthly income and spending targets.">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Monthly salary" error={errors.salary?.message}>
                <TextInput
                  {...register('salary', {
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or more' },
                  })}
                  type="number"
                  min="0"
                  step="1"
                  error={errors.salary?.message}
                />
              </Field>
              <Field label="Weekly budget" error={errors.weeklyBudget?.message}>
                <TextInput
                  {...register('weeklyBudget', {
                    required: 'Required',
                    min: { value: 0, message: 'Must be 0 or more' },
                  })}
                  type="number"
                  min="0"
                  step="1"
                  error={errors.weeklyBudget?.message}
                />
              </Field>
              <Field label="Salary day of month" error={errors.salaryDay?.message}>
                <TextInput
                  {...register('salaryDay', {
                    required: 'Required',
                    min: { value: 1, message: 'Min 1' },
                    max: { value: 31, message: 'Max 31' },
                  })}
                  type="number"
                  min="1"
                  max="31"
                  error={errors.salaryDay?.message}
                />
              </Field>
            </div>
          </Section>

          {/* 3. Currency */}
          <Section title="Currency" description="Symbol and code used throughout the app.">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Symbol" error={errors.currencySymbol?.message}>
                <TextInput
                  {...register('currencySymbol', { required: 'Required', maxLength: { value: 5, message: 'Too long' } })}
                  placeholder="€"
                  error={errors.currencySymbol?.message}
                />
              </Field>
              <Field label="Currency code" error={errors.currency?.message}>
                <TextInput
                  {...register('currency', { required: 'Required', maxLength: { value: 10, message: 'Too long' } })}
                  placeholder="EUR"
                  error={errors.currency?.message}
                />
              </Field>
            </div>
          </Section>

          {/* 4. Appearance */}
          <Section title="Appearance" description="Theme and display preferences.">
            <Field label="Theme">
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setValue('theme', t, { shouldDirty: true })}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize border transition-colors
                      focus:outline-none focus:ring-2 focus:ring-ring
                      ${theme === t
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-input hover:bg-muted'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Field>
            <ToggleRow
              label="Privacy mode"
              description="Blur monetary values when not focused."
              checked={privacyMode}
              onChange={(v) => setValue('privacyMode', v, { shouldDirty: true })}
            />
          </Section>

          {/* 5. Notifications */}
          <Section title="Notifications" description="Alerts and reminders you want to receive.">
            <div className="space-y-3 divide-y divide-border">
              <ToggleRow
                label="Weekly budget at 80%"
                checked={notifWeeklyBudget80}
                onChange={(v) => setValue('notifWeeklyBudget80', v, { shouldDirty: true })}
              />
              <div className="pt-3">
                <ToggleRow
                  label="Weekly budget at 90%"
                  checked={notifWeeklyBudget90}
                  onChange={(v) => setValue('notifWeeklyBudget90', v, { shouldDirty: true })}
                />
              </div>
              <div className="pt-3">
                <ToggleRow
                  label="Weekly budget at 100%"
                  description="Alert when weekly budget is fully spent."
                  checked={notifWeeklyBudget100}
                  onChange={(v) => setValue('notifWeeklyBudget100', v, { shouldDirty: true })}
                />
              </div>
              <div className="pt-3">
                <ToggleRow
                  label="Bill due reminder"
                  description="Remind when a fixed expense is due."
                  checked={notifBillDue}
                  onChange={(v) => setValue('notifBillDue', v, { shouldDirty: true })}
                />
              </div>
              <div className="pt-3">
                <ToggleRow
                  label="Salary expected"
                  description="Reminder on salary day."
                  checked={notifSalaryExpected}
                  onChange={(v) => setValue('notifSalaryExpected', v, { shouldDirty: true })}
                />
              </div>
            </div>
          </Section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isDirty}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold
                hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Save changes
            </button>
          </div>
        </form>

        {/* 6. Data — outside the main form */}
        <Section title="Data" description="Export, import, or reset your financial data.">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">Export backup</p>
                <p className="text-xs text-muted-foreground">Download all data as a JSON file.</p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                className="shrink-0 px-4 py-2 rounded-lg border border-input bg-background text-sm font-medium
                  hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                Export JSON
              </button>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium text-foreground">Import backup</p>
                <p className="text-xs text-muted-foreground">Restore from a previously exported JSON file.</p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 px-4 py-2 rounded-lg border border-input bg-background text-sm font-medium
                  hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                Import JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
                className="sr-only"
              />
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
              <div>
                <p className="text-sm font-medium text-foreground">Clear all data</p>
                <p className="text-xs text-muted-foreground">Permanently delete all transactions and settings.</p>
              </div>
              <button
                type="button"
                onClick={handleClearData}
                className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-colors
                  ${confirmClear
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'border border-destructive text-destructive hover:bg-destructive/10'}`}
              >
                {confirmClear ? 'Tap again to confirm' : 'Clear data'}
              </button>
            </div>
          </div>
        </Section>
      </div>
    </AppLayout>
  )
}
