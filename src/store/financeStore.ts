import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { format } from 'date-fns'
import type { Expense, FixedExpense, BudgetMonth, SavingsTemplate, Settings } from '@/types'
import { DEFAULT_SETTINGS, DEFAULT_FIXED_EXPENSES } from '@/constants'
import { StorageService } from '@/lib/storage'

// Per-user localStorage adapter — mutate .userId then call persist.rehydrate()
export const userStorageAdapter = {
  userId: 'guest',
  getItem(name: string): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(`${name}__${this.userId}`)
  },
  setItem(name: string, value: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(`${name}__${this.userId}`, value)
  },
  removeItem(name: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(`${name}__${this.userId}`)
  },
}

const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

const today = () => format(new Date(), 'yyyy-MM-dd')

interface FinanceState {
  currentMonth: BudgetMonth | null
  months: BudgetMonth[]
  expenses: Expense[]
  fixedExpenses: FixedExpense[]
  savingsTemplates: SavingsTemplate[]
  settings: Settings
  lastDeletedExpense: Expense | null

  startNewMonth: () => void
  archiveCurrentMonth: () => void

  addExpense: (e: Omit<Expense, 'id' | 'budgetMonthId'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  duplicateExpense: (id: string) => void
  undoDeleteExpense: () => void

  addFixedExpense: (fe: Omit<FixedExpense, 'id' | 'budgetMonthId' | 'isPaid' | 'paidDate'>) => void
  updateFixedExpense: (id: string, updates: Partial<FixedExpense>) => void
  deleteFixedExpense: (id: string) => void
  markFixedExpensePaid: (id: string) => void
  unmarkFixedExpensePaid: (id: string) => void
  resetFixedExpensesForNewMonth: (monthId: string) => void

  addSavingsTemplate: (t: Omit<SavingsTemplate, 'id'>) => void
  updateSavingsTemplate: (id: string, updates: Partial<SavingsTemplate>) => void
  deleteSavingsTemplate: (id: string) => void
  useSavingsTemplate: (id: string, amount?: number) => void

  updateSettings: (updates: Partial<Settings>) => void
  updateCurrentMonthIncome: (income: number) => void

  importData: (json: string) => boolean
  exportData: () => string
  reloadForUser: (userId: string) => Promise<void>
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      currentMonth: null,
      months: [],
      expenses: [],
      fixedExpenses: DEFAULT_FIXED_EXPENSES.map(fe => ({
        ...fe,
        id: id(),
        budgetMonthId: '',
        isPaid: false,
      })),
      savingsTemplates: [],
      settings: DEFAULT_SETTINGS,
      lastDeletedExpense: null,

      startNewMonth: () => {
        const { currentMonth, months, expenses, settings } = get()
        const newMonthId = id()
        const todayStr = today()

        // Archive current month if exists
        const updatedMonths = currentMonth
          ? [
              ...months,
              { ...currentMonth, endDate: todayStr, isActive: false, archivedAt: todayStr },
            ]
          : months

        // Create new month
        const newMonth: BudgetMonth = {
          id: newMonthId,
          startDate: todayStr,
          income: settings.salary,
          weeklyBudget: settings.weeklyBudget,
          isActive: true,
        }

        // Auto-add salary income expense
        const salaryExpense: Expense = {
          id: id(),
          amount: settings.salary,
          description: 'Monthly Salary',
          category: 'salary',
          date: todayStr,
          budgetMonthId: newMonthId,
          type: 'income',
        }

        // Reset fixed expenses for new month
        const newFixedExpenses: FixedExpense[] = DEFAULT_FIXED_EXPENSES.map(fe => ({
          ...fe,
          id: id(),
          budgetMonthId: newMonthId,
          isPaid: false,
        }))

        set({
          currentMonth: newMonth,
          months: updatedMonths,
          expenses: [...expenses, salaryExpense],
          fixedExpenses: newFixedExpenses,
        })
      },

      archiveCurrentMonth: () => {
        const { currentMonth, months } = get()
        if (!currentMonth) return
        const todayStr = today()
        const archived: BudgetMonth = {
          ...currentMonth,
          endDate: todayStr,
          isActive: false,
          archivedAt: todayStr,
        }
        set({
          currentMonth: null,
          months: [...months, archived],
        })
      },

      addExpense: (e) => {
        const { currentMonth, expenses } = get()
        const newExpense: Expense = {
          ...e,
          id: id(),
          budgetMonthId: currentMonth?.id ?? '',
        }
        set({ expenses: [...expenses, newExpense] })
      },

      updateExpense: (expenseId, updates) => {
        set(state => ({
          expenses: state.expenses.map(e =>
            e.id === expenseId ? { ...e, ...updates } : e
          ),
        }))
      },

      deleteExpense: (expenseId) => {
        const { expenses } = get()
        const target = expenses.find(e => e.id === expenseId) ?? null
        set({
          lastDeletedExpense: target,
          expenses: expenses.filter(e => e.id !== expenseId),
        })
      },

      duplicateExpense: (expenseId) => {
        const { expenses } = get()
        const original = expenses.find(e => e.id === expenseId)
        if (!original) return
        const duplicate: Expense = {
          ...original,
          id: id(),
          date: today(),
        }
        set({ expenses: [...expenses, duplicate] })
      },

      undoDeleteExpense: () => {
        const { lastDeletedExpense, expenses } = get()
        if (!lastDeletedExpense) return
        set({
          expenses: [...expenses, lastDeletedExpense],
          lastDeletedExpense: null,
        })
      },

      addFixedExpense: (fe) => {
        const { currentMonth, fixedExpenses } = get()
        const newFe: FixedExpense = {
          ...fe,
          id: id(),
          budgetMonthId: currentMonth?.id ?? '',
          isPaid: false,
        }
        set({ fixedExpenses: [...fixedExpenses, newFe] })
      },

      updateFixedExpense: (feId, updates) => {
        set(state => ({
          fixedExpenses: state.fixedExpenses.map(fe =>
            fe.id === feId ? { ...fe, ...updates } : fe
          ),
        }))
      },

      deleteFixedExpense: (feId) => {
        set(state => ({
          fixedExpenses: state.fixedExpenses.filter(fe => fe.id !== feId),
        }))
      },

      markFixedExpensePaid: (feId) => {
        const { fixedExpenses, expenses, currentMonth } = get()
        const fe = fixedExpenses.find(f => f.id === feId)
        if (!fe) return

        const todayStr = today()

        const updatedFixed = fixedExpenses.map(f =>
          f.id === feId ? { ...f, isPaid: true, paidDate: todayStr } : f
        )

        // Create a corresponding expense record
        const expenseRecord: Expense = {
          id: id(),
          amount: fe.amount,
          description: fe.name,
          category: fe.category,
          date: todayStr,
          budgetMonthId: currentMonth?.id ?? fe.budgetMonthId,
          type: 'expense',
        }

        set({
          fixedExpenses: updatedFixed,
          expenses: [...expenses, expenseRecord],
        })
      },

      unmarkFixedExpensePaid: (feId) => {
        set(state => ({
          fixedExpenses: state.fixedExpenses.map(fe =>
            fe.id === feId ? { ...fe, isPaid: false, paidDate: undefined } : fe
          ),
        }))
      },

      resetFixedExpensesForNewMonth: (monthId) => {
        const newFixedExpenses: FixedExpense[] = DEFAULT_FIXED_EXPENSES.map(fe => ({
          ...fe,
          id: id(),
          budgetMonthId: monthId,
          isPaid: false,
        }))
        set({ fixedExpenses: newFixedExpenses })
      },

      addSavingsTemplate: (t) => {
        const newTemplate: SavingsTemplate = { ...t, id: id() }
        set(state => ({ savingsTemplates: [...state.savingsTemplates, newTemplate] }))
      },

      updateSavingsTemplate: (templateId, updates) => {
        set(state => ({
          savingsTemplates: state.savingsTemplates.map(t =>
            t.id === templateId ? { ...t, ...updates } : t
          ),
        }))
      },

      deleteSavingsTemplate: (templateId) => {
        set(state => ({
          savingsTemplates: state.savingsTemplates.filter(t => t.id !== templateId),
        }))
      },

      useSavingsTemplate: (templateId, amount) => {
        const { savingsTemplates, expenses, currentMonth } = get()
        const template = savingsTemplates.find(t => t.id === templateId)
        if (!template) return
        const savingsExpense: Expense = {
          id: id(),
          amount: amount ?? template.amount,
          description: template.name,
          category: 'savings',
          date: today(),
          budgetMonthId: currentMonth?.id ?? '',
          type: 'savings',
        }
        set({ expenses: [...expenses, savingsExpense] })
      },

      updateSettings: (updates) => {
        set(state => ({
          settings: { ...state.settings, ...updates },
        }))
      },

      updateCurrentMonthIncome: (income) => {
        set(state => ({
          currentMonth: state.currentMonth
            ? { ...state.currentMonth, income }
            : null,
        }))
      },

      importData: (json) => {
        const success = StorageService.importAll(json)
        if (success) {
          // Reload all state from storage after import
          set({
            settings: StorageService.getSettings(),
            months: StorageService.getMonths(),
            expenses: StorageService.getExpenses(),
            fixedExpenses: StorageService.getFixedExpenses(),
            savingsTemplates: StorageService.getSavingsTemplates(),
            currentMonth:
              StorageService.getMonths().find(m => m.isActive) ?? null,
          })
        }
        return success
      },

      reloadForUser: async (userId: string) => {
        userStorageAdapter.userId = userId
        await useFinanceStore.persist.rehydrate()
      },

      exportData: () => {
        const { settings, months, expenses, fixedExpenses, savingsTemplates, currentMonth } = get()
        const allMonths = currentMonth
          ? [...months.filter(m => m.id !== currentMonth.id), currentMonth]
          : months
        StorageService.saveSettings(settings)
        StorageService.saveMonths(allMonths)
        StorageService.saveExpenses(expenses)
        StorageService.saveFixedExpenses(fixedExpenses)
        StorageService.saveSavingsTemplates(savingsTemplates)
        return StorageService.exportAll()
      },
    }),
    {
      name: 'budget-app-store',
      storage: createJSONStorage(() => userStorageAdapter),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<FinanceState>
        return {
          ...current,
          ...persistedState,
          settings: {
            ...current.settings,
            ...(persistedState.settings ?? {}),
            notifications: {
              ...current.settings.notifications,
              ...(persistedState.settings?.notifications ?? {}),
            },
          },
        }
      },
    }
  )
)
