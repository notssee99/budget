import { supabase } from './supabase'
import type { Expense, FixedExpense, BudgetMonth, SavingsTemplate, Settings, SharedSavingsGoal, SharedContribution } from '@/types'
import { DEFAULT_SETTINGS } from '@/constants'

// ── helpers ─────────────────────────────────────────────────────────────────

function monthFromRow(r: Record<string, unknown>): BudgetMonth {
  return {
    id: r.id as string,
    startDate: r.start_date as string,
    endDate: r.end_date as string | undefined,
    income: Number(r.income),
    weeklyBudget: Number(r.weekly_budget),
    isActive: r.is_active as boolean,
    archivedAt: r.archived_at as string | undefined,
  }
}

function monthToRow(userId: string, m: BudgetMonth) {
  return {
    id: m.id,
    user_id: userId,
    start_date: m.startDate,
    end_date: m.endDate ?? null,
    income: m.income,
    weekly_budget: m.weeklyBudget,
    is_active: m.isActive,
    archived_at: m.archivedAt ?? null,
  }
}

function expenseFromRow(r: Record<string, unknown>): Expense {
  return {
    id: r.id as string,
    amount: Number(r.amount),
    description: r.description as string,
    category: r.category as Expense['category'],
    date: r.date as string,
    notes: r.notes as string | undefined,
    budgetMonthId: r.budget_month_id as string,
    type: r.type as Expense['type'],
    isFixed: r.is_fixed as boolean | undefined,
  }
}

function expenseToRow(userId: string, e: Expense) {
  return {
    id: e.id,
    user_id: userId,
    amount: e.amount,
    description: e.description,
    category: e.category,
    date: e.date,
    notes: e.notes ?? null,
    budget_month_id: e.budgetMonthId,
    type: e.type,
    is_fixed: e.isFixed ?? false,
  }
}

function fixedFromRow(r: Record<string, unknown>): FixedExpense {
  return {
    id: r.id as string,
    name: r.name as string,
    amount: Number(r.amount),
    dueDay: Number(r.due_day),
    category: r.category as FixedExpense['category'],
    isPaid: r.is_paid as boolean,
    paidDate: r.paid_date as string | undefined,
    budgetMonthId: r.budget_month_id as string,
  }
}

function fixedToRow(userId: string, fe: FixedExpense) {
  return {
    id: fe.id,
    user_id: userId,
    name: fe.name,
    amount: fe.amount,
    due_day: fe.dueDay,
    category: fe.category,
    is_paid: fe.isPaid,
    paid_date: fe.paidDate ?? null,
    budget_month_id: fe.budgetMonthId,
  }
}

function settingsFromRow(r: Record<string, unknown>): Settings {
  return {
    salary: Number(r.salary),
    weeklyBudget: Number(r.weekly_budget),
    currency: r.currency as string,
    currencySymbol: r.currency_symbol as string,
    theme: r.theme as Settings['theme'],
    salaryDay: Number(r.salary_day),
    privacyMode: r.privacy_mode as boolean,
    userName: r.user_name as string,
    notifications: (r.notifications as Settings['notifications']) ?? DEFAULT_SETTINGS.notifications,
  }
}

function settingsToRow(userId: string, s: Settings) {
  return {
    user_id: userId,
    salary: s.salary,
    weekly_budget: s.weeklyBudget,
    currency: s.currency,
    currency_symbol: s.currencySymbol,
    theme: s.theme,
    salary_day: s.salaryDay,
    privacy_mode: s.privacyMode,
    user_name: s.userName,
    notifications: s.notifications,
  }
}

function templateFromRow(r: Record<string, unknown>): SavingsTemplate {
  return {
    id: r.id as string,
    name: r.name as string,
    icon: r.icon as string,
    amount: Number(r.amount),
    category: r.category as string | undefined,
    description: r.description as string | undefined,
  }
}

function templateToRow(userId: string, t: SavingsTemplate) {
  return {
    id: t.id,
    user_id: userId,
    name: t.name,
    icon: t.icon,
    amount: t.amount,
    category: t.category ?? null,
    description: t.description ?? null,
  }
}

function goalFromRow(r: Record<string, unknown>, contributions: SharedContribution[]): SharedSavingsGoal {
  return {
    id: r.id as string,
    name: r.name as string,
    icon: r.icon as string,
    targetAmount: Number(r.target_amount),
    description: r.description as string | undefined,
    createdAt: r.created_at as string,
    contributions,
  }
}

function goalToRow(g: SharedSavingsGoal) {
  return {
    id: g.id,
    name: g.name,
    icon: g.icon,
    target_amount: g.targetAmount,
    description: g.description ?? null,
    created_at: g.createdAt,
  }
}

function contribFromRow(r: Record<string, unknown>): SharedContribution {
  return {
    id: r.id as string,
    userId: r.user_id as string,
    userName: r.user_name as string,
    amount: Number(r.amount),
    description: r.description as string,
    date: r.date as string,
  }
}

// ── Budget Months ────────────────────────────────────────────────────────────

export async function getMonths(userId: string): Promise<BudgetMonth[]> {
  const { data } = await supabase.from('budget_months').select('*').eq('user_id', userId)
  return (data ?? []).map(r => monthFromRow(r as Record<string, unknown>))
}

export async function saveMonth(userId: string, month: BudgetMonth): Promise<void> {
  await supabase.from('budget_months').upsert(monthToRow(userId, month))
}

export async function updateMonth(userId: string, month: BudgetMonth): Promise<void> {
  await supabase.from('budget_months').upsert(monthToRow(userId, month))
}

// ── Expenses ─────────────────────────────────────────────────────────────────

export async function getExpenses(userId: string): Promise<Expense[]> {
  const { data } = await supabase.from('expenses').select('*').eq('user_id', userId)
  return (data ?? []).map(r => expenseFromRow(r as Record<string, unknown>))
}

export async function insertExpense(userId: string, expense: Expense): Promise<void> {
  await supabase.from('expenses').insert(expenseToRow(userId, expense))
}

export async function dbUpdateExpense(userId: string, id: string, updates: Partial<Expense>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (updates.amount !== undefined) row.amount = updates.amount
  if (updates.description !== undefined) row.description = updates.description
  if (updates.category !== undefined) row.category = updates.category
  if (updates.date !== undefined) row.date = updates.date
  if (updates.notes !== undefined) row.notes = updates.notes
  if (updates.type !== undefined) row.type = updates.type
  await supabase.from('expenses').update(row).eq('id', id).eq('user_id', userId)
}

export async function dbDeleteExpense(userId: string, id: string): Promise<void> {
  await supabase.from('expenses').delete().eq('id', id).eq('user_id', userId)
}

export async function insertExpenses(userId: string, expenses: Expense[]): Promise<void> {
  if (!expenses.length) return
  await supabase.from('expenses').insert(expenses.map(e => expenseToRow(userId, e)))
}

// ── Fixed Expenses ────────────────────────────────────────────────────────────

export async function getFixedExpenses(userId: string): Promise<FixedExpense[]> {
  const { data } = await supabase.from('fixed_expenses').select('*').eq('user_id', userId)
  return (data ?? []).map(r => fixedFromRow(r as Record<string, unknown>))
}

export async function insertFixedExpense(userId: string, fe: FixedExpense): Promise<void> {
  await supabase.from('fixed_expenses').insert(fixedToRow(userId, fe))
}

export async function dbUpdateFixedExpense(userId: string, id: string, updates: Partial<FixedExpense>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (updates.isPaid !== undefined) row.is_paid = updates.isPaid
  if (updates.paidDate !== undefined) row.paid_date = updates.paidDate ?? null
  if (updates.amount !== undefined) row.amount = updates.amount
  if (updates.name !== undefined) row.name = updates.name
  await supabase.from('fixed_expenses').update(row).eq('id', id).eq('user_id', userId)
}

export async function dbDeleteFixedExpense(userId: string, id: string): Promise<void> {
  await supabase.from('fixed_expenses').delete().eq('id', id).eq('user_id', userId)
}

export async function replaceFixedExpenses(userId: string, fes: FixedExpense[]): Promise<void> {
  await supabase.from('fixed_expenses').delete().eq('user_id', userId)
  if (fes.length) await supabase.from('fixed_expenses').insert(fes.map(fe => fixedToRow(userId, fe)))
}

// ── Settings ─────────────────────────────────────────────────────────────────

export async function getSettings(userId: string): Promise<Settings | null> {
  const { data } = await supabase.from('settings').select('*').eq('user_id', userId).single()
  if (!data) return null
  return settingsFromRow(data as Record<string, unknown>)
}

export async function saveSettings(userId: string, s: Settings): Promise<void> {
  await supabase.from('settings').upsert(settingsToRow(userId, s))
}

// ── Savings Templates ─────────────────────────────────────────────────────────

export async function getSavingsTemplates(userId: string): Promise<SavingsTemplate[]> {
  const { data } = await supabase.from('savings_templates').select('*').eq('user_id', userId)
  return (data ?? []).map(r => templateFromRow(r as Record<string, unknown>))
}

export async function insertSavingsTemplate(userId: string, t: SavingsTemplate): Promise<void> {
  await supabase.from('savings_templates').insert(templateToRow(userId, t))
}

export async function dbUpdateSavingsTemplate(userId: string, id: string, updates: Partial<SavingsTemplate>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (updates.name !== undefined) row.name = updates.name
  if (updates.icon !== undefined) row.icon = updates.icon
  if (updates.amount !== undefined) row.amount = updates.amount
  if (updates.category !== undefined) row.category = updates.category ?? null
  if (updates.description !== undefined) row.description = updates.description ?? null
  await supabase.from('savings_templates').update(row).eq('id', id).eq('user_id', userId)
}

export async function dbDeleteSavingsTemplate(userId: string, id: string): Promise<void> {
  await supabase.from('savings_templates').delete().eq('id', id).eq('user_id', userId)
}

// ── Shared Goals ──────────────────────────────────────────────────────────────

export async function getSharedGoals(): Promise<SharedSavingsGoal[]> {
  const { data: goals } = await supabase.from('shared_savings_goals').select('*')
  const { data: contribs } = await supabase.from('shared_contributions').select('*')
  const contribRows = (contribs ?? []) as Record<string, unknown>[]
  return (goals ?? []).map(r => {
    const row = r as Record<string, unknown>
    const goalContribs = contribRows
      .filter(c => c.goal_id === row.id)
      .map(c => contribFromRow(c))
    return goalFromRow(row, goalContribs)
  })
}

export async function insertSharedGoal(goal: SharedSavingsGoal): Promise<void> {
  await supabase.from('shared_savings_goals').insert(goalToRow(goal))
}

export async function dbUpdateSharedGoal(id: string, updates: Partial<SharedSavingsGoal>): Promise<void> {
  const row: Record<string, unknown> = {}
  if (updates.name !== undefined) row.name = updates.name
  if (updates.icon !== undefined) row.icon = updates.icon
  if (updates.targetAmount !== undefined) row.target_amount = updates.targetAmount
  if (updates.description !== undefined) row.description = updates.description ?? null
  await supabase.from('shared_savings_goals').update(row).eq('id', id)
}

export async function dbDeleteSharedGoal(id: string): Promise<void> {
  await supabase.from('shared_savings_goals').delete().eq('id', id)
}

export async function insertSharedContribution(goalId: string, contrib: SharedContribution): Promise<void> {
  await supabase.from('shared_contributions').insert({
    id: contrib.id,
    goal_id: goalId,
    user_id: contrib.userId,
    user_name: contrib.userName,
    amount: contrib.amount,
    description: contrib.description,
    date: contrib.date,
  })
}

export async function dbDeleteSharedContribution(id: string): Promise<void> {
  await supabase.from('shared_contributions').delete().eq('id', id)
}
