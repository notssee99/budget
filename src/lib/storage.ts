// To migrate to Supabase: replace StorageService methods with Supabase client calls

import { Expense, FixedExpense, BudgetMonth, SavingsTemplate, Settings } from '@/types';
import { DEFAULT_SETTINGS } from '@/constants';

export const STORAGE_KEYS = {
  BUDGET_MONTHS: 'budget_months',
  EXPENSES: 'expenses',
  FIXED_EXPENSES: 'fixed_expenses',
  SAVINGS_TEMPLATES: 'budgetapp_savings_templates',
  SETTINGS: 'settings',
  BACKUPS: 'backups',
} as const;

function safeGet<T>(key: string, fallback: T): T {
  try {
    if (typeof window === 'undefined') return fallback;
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently ignore write errors (e.g. storage quota exceeded)
  }
}

export const StorageService = {
  getSettings(): Settings {
    return safeGet<Settings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },

  saveSettings(s: Settings): void {
    safeSet(STORAGE_KEYS.SETTINGS, s);
  },

  getMonths(): BudgetMonth[] {
    return safeGet<BudgetMonth[]>(STORAGE_KEYS.BUDGET_MONTHS, []);
  },

  saveMonths(months: BudgetMonth[]): void {
    safeSet(STORAGE_KEYS.BUDGET_MONTHS, months);
  },

  getExpenses(): Expense[] {
    return safeGet<Expense[]>(STORAGE_KEYS.EXPENSES, []);
  },

  saveExpenses(expenses: Expense[]): void {
    safeSet(STORAGE_KEYS.EXPENSES, expenses);
  },

  getFixedExpenses(): FixedExpense[] {
    return safeGet<FixedExpense[]>(STORAGE_KEYS.FIXED_EXPENSES, []);
  },

  saveFixedExpenses(fixed: FixedExpense[]): void {
    safeSet(STORAGE_KEYS.FIXED_EXPENSES, fixed);
  },

  getSavingsTemplates(): SavingsTemplate[] {
    return safeGet<SavingsTemplate[]>(STORAGE_KEYS.SAVINGS_TEMPLATES, []);
  },

  saveSavingsTemplates(templates: SavingsTemplate[]): void {
    safeSet(STORAGE_KEYS.SAVINGS_TEMPLATES, templates);
  },

  exportAll(): string {
    return JSON.stringify({
      settings: this.getSettings(),
      months: this.getMonths(),
      expenses: this.getExpenses(),
      fixedExpenses: this.getFixedExpenses(),
      savingsTemplates: this.getSavingsTemplates(),
      exportedAt: new Date().toISOString(),
    });
  },

  importAll(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as Record<string, unknown>;

      if (typeof parsed !== 'object' || parsed === null) return false;

      if (parsed.settings !== undefined) {
        this.saveSettings(parsed.settings as Settings);
      }
      if (Array.isArray(parsed.months)) {
        this.saveMonths(parsed.months as BudgetMonth[]);
      }
      if (Array.isArray(parsed.expenses)) {
        this.saveExpenses(parsed.expenses as Expense[]);
      }
      if (Array.isArray(parsed.fixedExpenses)) {
        this.saveFixedExpenses(parsed.fixedExpenses as FixedExpense[]);
      }
      if (Array.isArray(parsed.savingsTemplates)) {
        this.saveSavingsTemplates(parsed.savingsTemplates as SavingsTemplate[]);
      }

      return true;
    } catch {
      return false;
    }
  },

  createBackup(): void {
    const backups = this.getBackups();
    const newBackup = {
      timestamp: new Date().toISOString(),
      data: this.exportAll(),
    };
    const updated = [newBackup, ...backups].slice(0, 5);
    safeSet(STORAGE_KEYS.BACKUPS, updated);
  },

  getBackups(): { timestamp: string; data: string }[] {
    return safeGet<{ timestamp: string; data: string }[]>(STORAGE_KEYS.BACKUPS, []);
  },

  clearAll(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch {
        // Silently ignore
      }
    });
  },
};
