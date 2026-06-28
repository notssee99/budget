import type { Category, Settings } from '../types'

export const DEFAULT_SETTINGS: Settings = {
  salary: 1734,
  weeklyBudget: 120,
  currency: 'EUR',
  currencySymbol: '€',
  theme: 'system',
  salaryDay: 1,
  privacyMode: false,
  userName: '',
  notifications: {
    weeklyBudget80: true,
    weeklyBudget90: true,
    weeklyBudget100: true,
    billDue: true,
    salaryExpected: true,
  },
}

export const DEFAULT_FIXED_EXPENSES = [
  { name: 'Rent', amount: 200, dueDay: 1, category: 'bills' as Category },
  { name: 'Bank Payment', amount: 350, dueDay: 1, category: 'bills' as Category },
  { name: 'Loan / Bank Fee', amount: 60, dueDay: 1, category: 'bills' as Category },
  { name: 'Phone', amount: 10, dueDay: 1, category: 'subscriptions' as Category },
  { name: 'Spotify', amount: 10, dueDay: 1, category: 'subscriptions' as Category },
  { name: 'ChatGPT', amount: 17, dueDay: 1, category: 'subscriptions' as Category },
]

export const CATEGORY_LABELS: Record<Category, string> = {
  coffee: 'Coffee',
  fuel: 'Fuel',
  groceries: 'Groceries',
  restaurant: 'Restaurant',
  shopping: 'Shopping',
  football: 'Football',
  entertainment: 'Entertainment',
  health: 'Health',
  transport: 'Transport',
  bills: 'Bills',
  subscriptions: 'Subscriptions',
  family: 'Family',
  electronics: 'Electronics',
  salary: 'Salary',
  savings: 'Savings',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<Category, string> = {
  coffee: '#a16207',       // amber-700
  fuel: '#b45309',         // amber-600
  groceries: '#16a34a',    // green-600
  restaurant: '#ea580c',   // orange-600
  shopping: '#9333ea',     // purple-600
  football: '#2563eb',     // blue-600
  entertainment: '#db2777', // pink-600
  health: '#dc2626',       // red-600
  transport: '#0891b2',    // cyan-600
  bills: '#4f46e5',        // indigo-600
  subscriptions: '#7c3aed', // violet-600
  family: '#d97706',       // amber-500
  electronics: '#0284c7',  // sky-600
  salary: '#15803d',       // green-700
  savings: '#0f766e',      // teal-700
  other: '#6b7280',        // gray-500
}

export const BUDGET_STATUS_CONFIG: Record<
  'excellent' | 'good' | 'warning' | 'danger' | 'over',
  { color: string; bgColor: string; label: string; description: string }
> = {
  excellent: {
    color: '#15803d',
    bgColor: '#dcfce7',
    label: 'Excellent',
    description: 'You are well within your budget.',
  },
  good: {
    color: '#16a34a',
    bgColor: '#f0fdf4',
    label: 'Good',
    description: 'Spending is on track.',
  },
  warning: {
    color: '#d97706',
    bgColor: '#fef3c7',
    label: 'Warning',
    description: 'Approaching your weekly budget limit.',
  },
  danger: {
    color: '#dc2626',
    bgColor: '#fee2e2',
    label: 'Danger',
    description: 'Very close to or at your budget limit.',
  },
  over: {
    color: '#991b1b',
    bgColor: '#fecaca',
    label: 'Over Budget',
    description: 'You have exceeded your weekly budget.',
  },
}

export const QUICK_ADD_EXAMPLES: string[] = [
  'Coffee 2.5',
  'Fuel 45',
  'Salary 1734',
  'Lidl 36',
  'Netflix 15',
  'Gym 30',
  'Bus 2',
  'Pizza 12',
  'Pharmacy 8',
  'Amazon 25',
]
