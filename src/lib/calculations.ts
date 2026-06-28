import {
  format,
  parseISO,
  differenceInDays,
  addDays,
  startOfDay,
  isSameDay,
  isWithinInterval,
  addWeeks,
  getWeek,
} from 'date-fns';
import type {
  BudgetMonth,
  Category,
  DashboardStats,
  Expense,
  FixedExpense,
  Insight,
  Settings,
  WeekSummary,
} from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';

// ---------------------------------------------------------------------------
// ChartDataPoint (local type, not yet in types)
// ---------------------------------------------------------------------------
export interface ChartDataPoint {
  month: string;
  income: number;
  spent: number;
  savings: number;
}

// ---------------------------------------------------------------------------
// formatCurrency
// ---------------------------------------------------------------------------
export function formatCurrency(
  amount: number,
  symbol?: string,
  privacyMode?: boolean,
): string {
  if (privacyMode) return '••••••';
  const sym = symbol ?? DEFAULT_SETTINGS.currencySymbol ?? '€';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sym}${formatted}`;
}

// ---------------------------------------------------------------------------
// formatDate
// ---------------------------------------------------------------------------
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'MMM d, yyyy');
}

// ---------------------------------------------------------------------------
// Week helpers
// ---------------------------------------------------------------------------

/**
 * Returns 0-indexed week number relative to a budget month's start date.
 * Week 0 = days 0–6 from start, week 1 = days 7–13, etc.
 */
function weekIndexFromStart(startDate: Date, date: Date): number {
  const diff = differenceInDays(startOfDay(date), startOfDay(startDate));
  if (diff < 0) return -1;
  return Math.floor(diff / 7);
}

/**
 * Start and end (inclusive) of a given 0-indexed week from a budget month start.
 */
function weekInterval(
  startDate: Date,
  weekIndex: number,
): { start: Date; end: Date } {
  const start = addDays(startOfDay(startDate), weekIndex * 7);
  const end = addDays(start, 6);
  return { start, end };
}

// ---------------------------------------------------------------------------
// getAllWeekSummaries
// ---------------------------------------------------------------------------
export function getAllWeekSummaries(
  currentMonth: BudgetMonth,
  expenses: Expense[],
): WeekSummary[] {
  const start = parseISO(currentMonth.startDate);
  const today = startOfDay(new Date());
  const end = currentMonth.endDate ? parseISO(currentMonth.endDate) : today;

  const totalWeeks = Math.ceil((differenceInDays(end, start) + 1) / 7);
  const monthExpenses = expenses.filter(
    (e) => e.budgetMonthId === currentMonth.id && e.type === 'expense' && !e.isFixed,
  );
  const baseWeeklyBudget = currentMonth.weeklyBudget;

  const summaries: WeekSummary[] = [];
  let cumulativeRollover = 0;

  for (let i = 0; i < totalWeeks; i++) {
    const interval = weekInterval(start, i);
    const spent = monthExpenses
      .filter((e) => {
        const d = startOfDay(parseISO(e.date));
        return isWithinInterval(d, { start: interval.start, end: interval.end });
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const budget = baseWeeklyBudget + cumulativeRollover;
    const remaining = budget - spent;
    const rollover = Math.max(0, remaining); // only carry positive rollover
    const percentUsed = budget > 0 ? (spent / budget) * 100 : 0;

    summaries.push({
      weekNumber: i + 1,
      startDate: format(interval.start, 'yyyy-MM-dd'),
      endDate: format(interval.end, 'yyyy-MM-dd'),
      budget,
      spent,
      rollover,
      remaining,
      percentUsed,
    });

    cumulativeRollover = rollover;
  }

  return summaries;
}

// ---------------------------------------------------------------------------
// getCurrentWeekSummary
// ---------------------------------------------------------------------------
export function getCurrentWeekSummary(
  currentMonth: BudgetMonth,
  expenses: Expense[],
): WeekSummary {
  const start = parseISO(currentMonth.startDate);
  const today = startOfDay(new Date());
  const currentWeekIdx = Math.max(0, weekIndexFromStart(start, today));

  const summaries = getAllWeekSummaries(currentMonth, expenses);
  return (
    summaries[currentWeekIdx] ??
    summaries[summaries.length - 1] ?? {
      weekNumber: 1,
      startDate: currentMonth.startDate,
      endDate: format(addDays(start, 6), 'yyyy-MM-dd'),
      budget: currentMonth.weeklyBudget,
      spent: 0,
      rollover: 0,
      remaining: currentMonth.weeklyBudget,
      percentUsed: 0,
    }
  );
}

// ---------------------------------------------------------------------------
// computeDashboard
// ---------------------------------------------------------------------------
export function computeDashboard(params: {
  currentMonth: BudgetMonth | null;
  expenses: Expense[];
  fixedExpenses: FixedExpense[];
  settings: Settings;
}): DashboardStats {
  const { currentMonth, expenses, fixedExpenses, settings } = params;

  const zero: DashboardStats = {
    currentBalance: 0,
    monthlyIncome: 0,
    currentSavings: 0,
    totalFixedExpenses: 0,
    availableToSpend: 0,
    weeklyBudget: 0,
    weeklySpent: 0,
    weeklyRemaining: 0,
    weeklyRollover: 0,
    monthlySpent: 0,
    monthlyRemaining: 0,
    dailySafeSpend: 0,
    daysUntilSalary: 0,
    budgetStatus: 'good',
    spendingStreak: 0,
    weeklyPercentUsed: 0,
  };

  if (!currentMonth) return zero;

  const monthExpenses = expenses.filter(
    (e) => e.budgetMonthId === currentMonth.id,
  );

  const monthlyIncome = currentMonth.income;
  const totalFixedExpenses = fixedExpenses.reduce((s, f) => s + f.amount, 0);

  const currentSavings = monthExpenses
    .filter((e) => e.type === 'savings')
    .reduce((s, e) => s + e.amount, 0);

  const monthlySpent = monthExpenses
    .filter((e) => e.type === 'expense')
    .reduce((s, e) => s + e.amount, 0);

  const availableToSpend = monthlyIncome - totalFixedExpenses;
  const monthlyRemaining = availableToSpend - monthlySpent - currentSavings;
  const currentBalance = monthlyIncome - totalFixedExpenses - currentSavings - monthlySpent;

  // Weekly stats
  const weekSummary = getCurrentWeekSummary(currentMonth, expenses);
  const weeklyBudget = weekSummary.budget;
  const weeklySpent = weekSummary.spent;
  const weeklyRemaining = weekSummary.remaining;
  const weeklyRollover = weekSummary.rollover;
  const weeklyPercentUsed = weekSummary.percentUsed;

  // Days until salary
  const today = new Date();
  const salaryDay = settings.salaryDay ?? 1;
  let nextSalary = new Date(today.getFullYear(), today.getMonth() + 1, salaryDay);
  if (nextSalary <= today) {
    nextSalary = new Date(today.getFullYear(), today.getMonth() + 2, salaryDay);
  }
  const daysUntilSalary = Math.max(1, differenceInDays(nextSalary, today));

  const dailySafeSpend = monthlyRemaining / daysUntilSalary;

  // Budget status
  const spentPercent = availableToSpend > 0
    ? (monthlySpent / availableToSpend) * 100
    : 100;

  let budgetStatus: DashboardStats['budgetStatus'];
  if (spentPercent < 60) budgetStatus = 'excellent';
  else if (spentPercent < 75) budgetStatus = 'good';
  else if (spentPercent < 90) budgetStatus = 'warning';
  else if (spentPercent <= 100) budgetStatus = 'danger';
  else budgetStatus = 'over';

  // Spending streak: consecutive days from month start with no daily overspend
  const monthStart = parseISO(currentMonth.startDate);
  const dailyBudget = availableToSpend > 0
    ? availableToSpend / Math.max(1, differenceInDays(today, monthStart) + 1)
    : 0;
  const byDay = getExpensesByDay(monthExpenses.filter((e) => e.type === 'expense'), currentMonth.id);
  let spendingStreak = 0;
  let checkDay = monthStart;
  while (!isSameDay(checkDay, today) && checkDay <= today) {
    const key = format(checkDay, 'yyyy-MM-dd');
    const dayTotal = (byDay[key] ?? []).reduce((s, e) => s + e.amount, 0);
    if (dayTotal <= dailyBudget) {
      spendingStreak++;
    } else {
      spendingStreak = 0; // reset on overspend day
    }
    checkDay = addDays(checkDay, 1);
  }

  return {
    currentBalance,
    monthlyIncome,
    currentSavings,
    totalFixedExpenses,
    availableToSpend,
    weeklyBudget,
    weeklySpent,
    weeklyRemaining,
    weeklyRollover,
    monthlySpent,
    monthlyRemaining,
    dailySafeSpend,
    daysUntilSalary,
    budgetStatus,
    spendingStreak,
    weeklyPercentUsed,
  };
}

// ---------------------------------------------------------------------------
// getMonthlyChartData
// ---------------------------------------------------------------------------
export function getMonthlyChartData(
  months: BudgetMonth[],
  expenses: Expense[],
): ChartDataPoint[] {
  return months.map((month) => {
    const monthExpenses = expenses.filter((e) => e.budgetMonthId === month.id);
    const spent = monthExpenses
      .filter((e) => e.type === 'expense')
      .reduce((s, e) => s + e.amount, 0);
    const savings = monthExpenses
      .filter((e) => e.type === 'savings')
      .reduce((s, e) => s + e.amount, 0);
    return {
      month: format(parseISO(month.startDate), 'MMM yyyy'),
      income: month.income,
      spent,
      savings,
    };
  });
}

// ---------------------------------------------------------------------------
// getCategoryBreakdown
// ---------------------------------------------------------------------------
export function getCategoryBreakdown(
  expenses: Expense[],
  monthId?: string,
): { category: Category; amount: number; percentage: number; count: number }[] {
  const filtered = monthId
    ? expenses.filter((e) => e.budgetMonthId === monthId && e.type === 'expense')
    : expenses.filter((e) => e.type === 'expense');

  const totals = new Map<Category, { amount: number; count: number }>();
  let grandTotal = 0;

  for (const expense of filtered) {
    const cat = expense.category as Category;
    const existing = totals.get(cat) ?? { amount: 0, count: 0 };
    existing.amount += expense.amount;
    existing.count += 1;
    totals.set(cat, existing);
    grandTotal += expense.amount;
  }

  return Array.from(totals.entries())
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      count,
      percentage: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

// ---------------------------------------------------------------------------
// getInsights
// ---------------------------------------------------------------------------
export function getInsights(params: {
  currentMonth: BudgetMonth | null;
  months: BudgetMonth[];
  expenses: Expense[];
  settings: Settings;
}): Insight[] {
  const { currentMonth, months, expenses, settings } = params;
  const insights: Insight[] = [];

  if (!currentMonth) return insights;

  const currentExpenses = expenses.filter(
    (e) => e.budgetMonthId === currentMonth.id && e.type === 'expense',
  );
  const currentTotal = currentExpenses.reduce((s, e) => s + e.amount, 0);

  // Find previous month
  const sortedMonths = [...months].sort(
    (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime(),
  );
  const prevMonth = sortedMonths.find((m) => m.id !== currentMonth.id);
  const prevExpenses = prevMonth
    ? expenses.filter((e) => e.budgetMonthId === prevMonth.id && e.type === 'expense')
    : [];

  // Category comparison
  if (prevMonth && prevExpenses.length > 0) {
    const currentByCategory = getCategoryBreakdown(currentExpenses);
    const prevByCategory = getCategoryBreakdown(prevExpenses);

    for (const { category, amount: currentAmount } of currentByCategory) {
      const prev = prevByCategory.find((p) => p.category === category);
      if (!prev) continue;
      const change = currentAmount - prev.amount;
      const percentChange = prev.amount > 0 ? (change / prev.amount) * 100 : 0;

      if (Math.abs(percentChange) >= 20) {
        const increased = percentChange > 0;
        insights.push({
          id: `category-${category}`,
          type: increased ? 'warning' : 'achievement',
          title: increased
            ? `${category.charAt(0).toUpperCase() + category.slice(1)} spending up ${Math.round(percentChange)}%`
            : `${category.charAt(0).toUpperCase() + category.slice(1)} spending down ${Math.round(Math.abs(percentChange))}%`,
          description: increased
            ? `You've spent ${formatCurrency(currentAmount)} on ${category} this month vs ${formatCurrency(prev.amount)} last month.`
            : `Great job reducing your ${category} spending from ${formatCurrency(prev.amount)} to ${formatCurrency(currentAmount)}.`,
          category: category as Category,
          percentChange,
          amountChange: change,
          icon: increased ? '📈' : '📉',
          priority: increased ? 'medium' : 'low',
        });
      }
    }
  }

  // Over budget projection
  const today = new Date();
  const monthStart = parseISO(currentMonth.startDate);
  const daysElapsed = Math.max(1, differenceInDays(today, monthStart) + 1);
  const currentSavingsTotal = expenses
    .filter((e) => e.budgetMonthId === currentMonth.id && e.type === 'savings')
    .reduce((s, e) => s + e.amount, 0);
  const availableToSpend = currentMonth.income - currentSavingsTotal;
  const dailyRate = currentTotal / daysElapsed;
  const projectedTotal = dailyRate * 30;

  if (projectedTotal > availableToSpend && availableToSpend > 0) {
    insights.push({
      id: 'over-budget-projection',
      type: 'warning',
      title: 'Projected to exceed budget',
      description: `At your current spending rate, you'll spend ${formatCurrency(projectedTotal)} this month — ${formatCurrency(projectedTotal - availableToSpend)} over your available budget.`,
      icon: '⚠️',
      priority: 'high',
    });
  }

  // Coffee spending check
  const coffeeTotal = currentExpenses
    .filter((e) => e.category === 'coffee')
    .reduce((s, e) => s + e.amount, 0);
  if (coffeeTotal > 50) {
    insights.push({
      id: 'coffee-check',
      type: 'warning',
      title: `${formatCurrency(coffeeTotal)} on coffee this month`,
      description: 'Consider brewing at home some days — small changes add up over a year.',
      category: 'coffee',
      icon: '☕',
      priority: 'low',
    });
  }

  // Subscriptions check
  const subTotal = currentExpenses
    .filter((e) => e.category === 'subscriptions')
    .reduce((s, e) => s + e.amount, 0);
  if (subTotal > 30) {
    insights.push({
      id: 'subscriptions-check',
      type: 'warning',
      title: `${formatCurrency(subTotal)} in subscriptions`,
      description: 'Review your active subscriptions — unused ones are an easy win.',
      category: 'subscriptions',
      icon: '📱',
      priority: 'low',
    });
  }

  // Under budget achievement
  if (availableToSpend > 0 && currentTotal < availableToSpend * 0.6 && daysElapsed > 10) {
    insights.push({
      id: 'under-budget',
      type: 'achievement',
      title: 'Well under budget',
      description: `You've only spent ${Math.round((currentTotal / availableToSpend) * 100)}% of your available budget — keep it up!`,
      icon: '🏆',
      priority: 'low',
    });
  }

  return insights
    .sort((a, b) => {
      const order = { high: 0, medium: 1, low: 2 }
      return (order[a.priority] ?? 99) - (order[b.priority] ?? 99)
    })
    .slice(0, 8);
}

// ---------------------------------------------------------------------------
// getDaysInBudgetMonth
// ---------------------------------------------------------------------------
export function getDaysInBudgetMonth(month: BudgetMonth): number {
  const start = parseISO(month.startDate);
  const end = month.endDate ? parseISO(month.endDate) : new Date();
  return Math.max(1, differenceInDays(end, start) + 1);
}

// ---------------------------------------------------------------------------
// getExpensesByDay
// ---------------------------------------------------------------------------
export function getExpensesByDay(
  expenses: Expense[],
  monthId: string,
): Record<string, Expense[]> {
  const filtered = expenses.filter((e) => e.budgetMonthId === monthId);
  const result: Record<string, Expense[]> = {};
  for (const expense of filtered) {
    const key = format(parseISO(expense.date), 'yyyy-MM-dd');
    if (!result[key]) result[key] = [];
    result[key].push(expense);
  }
  return result;
}

// ---------------------------------------------------------------------------
// getTopExpenses
// ---------------------------------------------------------------------------
export function getTopExpenses(
  expenses: Expense[],
  monthId: string,
  limit = 5,
): Expense[] {
  return expenses
    .filter((e) => e.budgetMonthId === monthId && e.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}
