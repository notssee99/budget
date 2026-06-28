import { create } from 'zustand'
import { format } from 'date-fns'
import type { Expense, FixedExpense, BudgetMonth, SavingsTemplate, Settings } from '@/types'
import { DEFAULT_SETTINGS, DEFAULT_FIXED_EXPENSES } from '@/constants'
import * as db from '@/lib/db'

const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36)
const today = () => format(new Date(), 'yyyy-MM-dd')

function getUserId(): string | null {
  try {
    const { useAuthStore } = require('@/store/authStore')
    return useAuthStore.getState().user?.id ?? null
  } catch { return null }
}

interface FinanceState {
  currentMonth: BudgetMonth | null
  months: BudgetMonth[]
  expenses: Expense[]
  fixedExpenses: FixedExpense[]
  savingsTemplates: SavingsTemplate[]
  settings: Settings
  lastDeletedExpense: Expense | null
  isLoaded: boolean

  loadForUser: (userId: string) => Promise<void>

  startNewMonth: (startDate?: string) => void
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

  exportData: () => string
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
  currentMonth: null,
  months: [],
  expenses: [],
  fixedExpenses: [],
  savingsTemplates: [],
  settings: DEFAULT_SETTINGS,
  lastDeletedExpense: null,
  isLoaded: false,

  loadForUser: async (userId: string) => {
    set({ isLoaded: false })
    try {
      const [months, expenses, fixedExpenses, savingsTemplates, settings] = await Promise.all([
        db.getMonths(userId),
        db.getExpenses(userId),
        userId === 'festoni' ? db.getFixedExpensesAll() : db.getFixedExpenses(userId),
        db.getSavingsTemplates(userId),
        db.getSettings(userId),
      ])
      const currentMonth = months.find(m => m.isActive) ?? null

      // Auto-seed defaults for Festoni on first load (no fixed expenses yet)
      let finalFixed = fixedExpenses
      if (userId === 'festoni' && fixedExpenses.length === 0) {
        const seeded = DEFAULT_FIXED_EXPENSES.map(fe => ({
          ...fe,
          id: id(),
          budgetMonthId: currentMonth?.id ?? '',
          isPaid: false,
        }))
        db.replaceFixedExpenses(userId, seeded)
        finalFixed = seeded
      }

      set({
        months: months.filter(m => !m.isActive),
        currentMonth,
        expenses,
        fixedExpenses: finalFixed,
        savingsTemplates,
        settings: settings ?? DEFAULT_SETTINGS,
        isLoaded: true,
      })
    } catch {
      set({ isLoaded: true })
    }
  },

  startNewMonth: (startDate?: string) => {
    const { currentMonth, months, expenses, fixedExpenses, settings } = get()
    const userId = getUserId()
    const newMonthId = id()
    const todayStr = startDate ?? today()

    const archivedMonth = currentMonth
      ? { ...currentMonth, endDate: todayStr, isActive: false, archivedAt: todayStr }
      : null

    const updatedMonths = archivedMonth ? [...months, archivedMonth] : months

    const newMonth: BudgetMonth = {
      id: newMonthId,
      startDate: todayStr,
      income: settings.salary,
      weeklyBudget: settings.weeklyBudget,
      isActive: true,
    }

    const salaryExpense: Expense = {
      id: id(),
      amount: settings.salary,
      description: 'Monthly Salary',
      category: 'salary',
      date: todayStr,
      budgetMonthId: newMonthId,
      type: 'income',
    }

    // Carry over current fixed expenses (with their latest amounts/names) into the new month
    const baseFixed = fixedExpenses.length > 0 ? fixedExpenses : DEFAULT_FIXED_EXPENSES
    const newFixedExpenses: FixedExpense[] = baseFixed.map(fe => ({
      ...fe,
      id: id(),
      budgetMonthId: newMonthId,
      isPaid: false,
      paidDate: undefined,
    }))

    set({
      currentMonth: newMonth,
      months: updatedMonths,
      expenses: [...expenses, salaryExpense],
      fixedExpenses: newFixedExpenses,
    })

    if (userId) {
      if (archivedMonth) db.updateMonth(userId, archivedMonth)
      db.saveMonth(userId, newMonth)
      db.insertExpense(userId, salaryExpense)
      db.replaceFixedExpenses(userId, newFixedExpenses)
    }
  },

  archiveCurrentMonth: () => {
    const { currentMonth, months } = get()
    if (!currentMonth) return
    const userId = getUserId()
    const todayStr = today()
    const archived: BudgetMonth = {
      ...currentMonth,
      endDate: todayStr,
      isActive: false,
      archivedAt: todayStr,
    }
    set({ currentMonth: null, months: [...months, archived] })
    if (userId) db.updateMonth(userId, archived)
  },

  addExpense: (e) => {
    const { currentMonth, expenses } = get()
    const userId = getUserId()
    const newExpense: Expense = { ...e, id: id(), budgetMonthId: currentMonth?.id ?? '' }
    set({ expenses: [...expenses, newExpense] })
    if (userId) db.insertExpense(userId, newExpense)
  },

  updateExpense: (expenseId, updates) => {
    const userId = getUserId()
    set(state => ({
      expenses: state.expenses.map(e => e.id === expenseId ? { ...e, ...updates } : e),
    }))
    if (userId) db.dbUpdateExpense(userId, expenseId, updates)
  },

  deleteExpense: (expenseId) => {
    const { expenses } = get()
    const userId = getUserId()
    const target = expenses.find(e => e.id === expenseId) ?? null
    set({ lastDeletedExpense: target, expenses: expenses.filter(e => e.id !== expenseId) })
    if (userId) db.dbDeleteExpense(userId, expenseId)
  },

  duplicateExpense: (expenseId) => {
    const { expenses } = get()
    const userId = getUserId()
    const original = expenses.find(e => e.id === expenseId)
    if (!original) return
    const duplicate: Expense = { ...original, id: id(), date: today() }
    set({ expenses: [...expenses, duplicate] })
    if (userId) db.insertExpense(userId, duplicate)
  },

  undoDeleteExpense: () => {
    const { lastDeletedExpense, expenses } = get()
    if (!lastDeletedExpense) return
    const userId = getUserId()
    set({ expenses: [...expenses, lastDeletedExpense], lastDeletedExpense: null })
    if (userId) db.insertExpense(userId, lastDeletedExpense)
  },

  addFixedExpense: (fe) => {
    const { currentMonth, fixedExpenses } = get()
    const userId = getUserId()
    const newFe: FixedExpense = { ...fe, id: id(), budgetMonthId: currentMonth?.id ?? '', isPaid: false }
    set({ fixedExpenses: [...fixedExpenses, newFe] })
    if (userId) db.insertFixedExpense(userId, newFe)
  },

  updateFixedExpense: (feId, updates) => {
    const userId = getUserId()
    set(state => ({
      fixedExpenses: state.fixedExpenses.map(fe => fe.id === feId ? { ...fe, ...updates } : fe),
    }))
    if (userId) db.dbUpdateFixedExpense(userId, feId, updates)
  },

  deleteFixedExpense: (feId) => {
    const userId = getUserId()
    set(state => ({ fixedExpenses: state.fixedExpenses.filter(fe => fe.id !== feId) }))
    if (userId) db.dbDeleteFixedExpense(userId, feId)
  },

  markFixedExpensePaid: (feId) => {
    const { fixedExpenses, expenses, currentMonth } = get()
    const userId = getUserId()
    const fe = fixedExpenses.find(f => f.id === feId)
    if (!fe) return
    const todayStr = today()
    const updatedFixed = fixedExpenses.map(f =>
      f.id === feId ? { ...f, isPaid: true, paidDate: todayStr } : f
    )
    const expenseRecord: Expense = {
      id: id(),
      amount: fe.amount,
      description: fe.name,
      category: fe.category,
      date: todayStr,
      budgetMonthId: currentMonth?.id ?? fe.budgetMonthId,
      type: 'expense',
      isFixed: true,
    }
    set({ fixedExpenses: updatedFixed, expenses: [...expenses, expenseRecord] })
    if (userId) {
      db.dbUpdateFixedExpense(userId, feId, { isPaid: true, paidDate: todayStr })
      db.insertExpense(userId, expenseRecord)
    }
  },

  unmarkFixedExpensePaid: (feId) => {
    const userId = getUserId()
    set(state => ({
      fixedExpenses: state.fixedExpenses.map(fe =>
        fe.id === feId ? { ...fe, isPaid: false, paidDate: undefined } : fe
      ),
    }))
    if (userId) db.dbUpdateFixedExpense(userId, feId, { isPaid: false, paidDate: undefined })
  },

  resetFixedExpensesForNewMonth: (monthId) => {
    const userId = getUserId()
    const newFixedExpenses: FixedExpense[] = DEFAULT_FIXED_EXPENSES.map(fe => ({
      ...fe, id: id(), budgetMonthId: monthId, isPaid: false,
    }))
    set({ fixedExpenses: newFixedExpenses })
    if (userId) db.replaceFixedExpenses(userId, newFixedExpenses)
  },

  addSavingsTemplate: (t) => {
    const userId = getUserId()
    const newTemplate: SavingsTemplate = { ...t, id: id() }
    set(state => ({ savingsTemplates: [...state.savingsTemplates, newTemplate] }))
    if (userId) db.insertSavingsTemplate(userId, newTemplate)
  },

  updateSavingsTemplate: (templateId, updates) => {
    const userId = getUserId()
    set(state => ({
      savingsTemplates: state.savingsTemplates.map(t => t.id === templateId ? { ...t, ...updates } : t),
    }))
    if (userId) db.dbUpdateSavingsTemplate(userId, templateId, updates)
  },

  deleteSavingsTemplate: (templateId) => {
    const userId = getUserId()
    set(state => ({ savingsTemplates: state.savingsTemplates.filter(t => t.id !== templateId) }))
    if (userId) db.dbDeleteSavingsTemplate(userId, templateId)
  },

  useSavingsTemplate: (templateId, amount) => {
    const { savingsTemplates, expenses, currentMonth } = get()
    const userId = getUserId()
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
    if (userId) db.insertExpense(userId, savingsExpense)
  },

  updateSettings: (updates) => {
    const userId = getUserId()
    set(state => {
      const newSettings = { ...state.settings, ...updates }
      if (userId) db.saveSettings(userId, newSettings)
      return { settings: newSettings }
    })
  },

  updateCurrentMonthIncome: (income) => {
    const userId = getUserId()
    set(state => {
      const newMonth = state.currentMonth ? { ...state.currentMonth, income } : null
      if (userId && newMonth) db.updateMonth(userId, newMonth)
      return { currentMonth: newMonth }
    })
  },

  exportData: () => {
    const { settings, months, expenses, fixedExpenses, savingsTemplates, currentMonth } = get()
    const allMonths = currentMonth
      ? [...months.filter(m => m.id !== currentMonth.id), currentMonth]
      : months
    return JSON.stringify({ settings, months: allMonths, expenses, fixedExpenses, savingsTemplates, exportedAt: new Date().toISOString() })
  },
}))
