export type Category =
  | 'coffee' | 'fuel' | 'groceries' | 'restaurant' | 'shopping'
  | 'football' | 'entertainment' | 'health' | 'transport' | 'bills'
  | 'subscriptions' | 'family' | 'electronics' | 'salary' | 'savings' | 'other'

export type TransactionType = 'expense' | 'income' | 'savings'

export interface Expense {
  id: string
  amount: number
  description: string
  category: Category
  date: string
  notes?: string
  budgetMonthId: string
  type: TransactionType
  isFixed?: boolean
}

export interface FixedExpense {
  id: string
  name: string
  amount: number
  dueDay: number
  category: Category
  isPaid: boolean
  paidDate?: string
  budgetMonthId: string
}

export interface BudgetMonth {
  id: string
  startDate: string
  endDate?: string
  income: number
  weeklyBudget: number
  isActive: boolean
  archivedAt?: string
}

export interface SavingsTemplate {
  id: string
  name: string
  icon: string
  amount: number
  category?: string
  description?: string
}

export interface Settings {
  salary: number
  weeklyBudget: number
  currency: string
  currencySymbol: string
  theme: 'light' | 'dark' | 'system'
  salaryDay: number
  privacyMode: boolean
  userName: string
  notifications: {
    weeklyBudget80: boolean
    weeklyBudget90: boolean
    weeklyBudget100: boolean
    billDue: boolean
    salaryExpected: boolean
  }
}

export interface WeekSummary {
  weekNumber: number
  startDate: string
  endDate: string
  budget: number
  spent: number
  rollover: number
  remaining: number
  percentUsed: number
}

export interface DashboardStats {
  currentBalance: number
  monthlyIncome: number
  currentSavings: number
  totalFixedExpenses: number
  availableToSpend: number
  weeklyBudget: number
  weeklySpent: number
  weeklyRemaining: number
  weeklyRollover: number
  monthlySpent: number
  monthlyRemaining: number
  dailySafeSpend: number
  daysUntilSalary: number
  budgetStatus: 'excellent' | 'good' | 'warning' | 'danger' | 'over'
  spendingStreak: number
  weeklyPercentUsed: number
}

export interface Insight {
  id: string
  type: 'increase' | 'decrease' | 'warning' | 'achievement' | 'projection'
  title: string
  description: string
  category?: Category
  percentChange?: number
  amountChange?: number
  icon: string
  priority: 'high' | 'medium' | 'low'
}

export interface QuickInputResult {
  amount: number
  description: string
  category: Category
  type: TransactionType
}

export interface ChartDataPoint {
  name: string
  value: number
  date?: string
  category?: Category
}

export interface SharedContribution {
  id: string
  userId: string
  userName: string
  amount: number
  description: string
  date: string
}

export interface SharedSavingsGoal {
  id: string
  name: string
  icon: string
  targetAmount: number
  description?: string
  createdAt: string
  contributions: SharedContribution[]
}
