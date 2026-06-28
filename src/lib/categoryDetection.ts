import type { Category, TransactionType } from '@/types';

// ---------------------------------------------------------------------------
// CATEGORY_CONFIG
// ---------------------------------------------------------------------------
export const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    icon: string;
    color: string;
    keywords: string[];
  }
> = {
  coffee: {
    label: 'Coffee',
    icon: '☕',
    color: 'bg-amber-100 dark:bg-amber-900/30',
    keywords: ['coffee', 'cafe', 'starbucks', 'costa', 'nespresso', 'cappuccino', 'espresso', 'latte'],
  },
  fuel: {
    label: 'Fuel',
    icon: '⛽',
    color: 'bg-orange-100 dark:bg-orange-900/30',
    keywords: ['fuel', 'petrol', 'gas', 'station', 'shell', 'bp', 'diesel'],
  },
  groceries: {
    label: 'Groceries',
    icon: '🛒',
    color: 'bg-green-100 dark:bg-green-900/30',
    keywords: [
      'lidl', 'aldi', 'tesco', 'sainsbury', 'grocery', 'supermarket',
      'food', 'market', 'kaufland', 'carrefour', 'coop',
    ],
  },
  restaurant: {
    label: 'Restaurant',
    icon: '🍽️',
    color: 'bg-red-100 dark:bg-red-900/30',
    keywords: [
      'restaurant', 'pizza', 'sushi', 'burger', 'mcdonalds', 'kfc',
      'takeaway', 'dinner', 'lunch', 'bistro', 'taverna',
    ],
  },
  shopping: {
    label: 'Shopping',
    icon: '🛍️',
    color: 'bg-pink-100 dark:bg-pink-900/30',
    keywords: [
      'shop', 'store', 'amazon', 'zara', 'h&m', 'nike', 'adidas',
      'mall', 'shoes', 'clothes', 'clothing',
    ],
  },
  football: {
    label: 'Football',
    icon: '⚽',
    color: 'bg-lime-100 dark:bg-lime-900/30',
    keywords: [
      'football', 'soccer', 'ticket', 'stadium', 'match',
      'sport', 'gym', 'fitness', 'training',
    ],
  },
  entertainment: {
    label: 'Entertainment',
    icon: '🎬',
    color: 'bg-purple-100 dark:bg-purple-900/30',
    keywords: [
      'cinema', 'movie', 'netflix', 'disney', 'hbo', 'concert',
      'theatre', 'games', 'xbox', 'playstation', 'steam',
    ],
  },
  health: {
    label: 'Health',
    icon: '💊',
    color: 'bg-teal-100 dark:bg-teal-900/30',
    keywords: [
      'pharmacy', 'doctor', 'hospital', 'medicine', 'health',
      'dental', 'clinic', 'prescription',
    ],
  },
  transport: {
    label: 'Transport',
    icon: '🚗',
    color: 'bg-blue-100 dark:bg-blue-900/30',
    keywords: [
      'uber', 'taxi', 'bus', 'train', 'metro', 'transport',
      'parking', 'toll', 'car', 'flight', 'airport',
    ],
  },
  bills: {
    label: 'Bills',
    icon: '📄',
    color: 'bg-slate-100 dark:bg-slate-900/30',
    keywords: [
      'rent', 'electric', 'water', 'internet', 'gas',
      'bill', 'utility', 'payment', 'insurance', 'bank',
    ],
  },
  subscriptions: {
    label: 'Subscriptions',
    icon: '📱',
    color: 'bg-violet-100 dark:bg-violet-900/30',
    keywords: [
      'spotify', 'netflix', 'apple', 'google', 'subscription',
      'monthly', 'premium', 'youtube', 'chatgpt', 'openai', 'phone',
    ],
  },
  family: {
    label: 'Family',
    icon: '👨‍👩‍👧',
    color: 'bg-rose-100 dark:bg-rose-900/30',
    keywords: [
      'family', 'child', 'kids', 'school', 'baby',
      'gift', 'birthday', 'christmas',
    ],
  },
  electronics: {
    label: 'Electronics',
    icon: '💻',
    color: 'bg-cyan-100 dark:bg-cyan-900/30',
    keywords: [
      'apple', 'samsung', 'laptop', 'phone', 'computer',
      'iphone', 'tv', 'tablet', 'electronics', 'tech',
    ],
  },
  salary: {
    label: 'Salary',
    icon: '💰',
    color: 'bg-emerald-100 dark:bg-emerald-900/30',
    keywords: [
      'salary', 'wage', 'income', 'paycheck',
      'payment received', 'transfer in',
    ],
  },
  savings: {
    label: 'Savings',
    icon: '🏦',
    color: 'bg-indigo-100 dark:bg-indigo-900/30',
    keywords: ['savings', 'save', 'deposit', 'investment', 'fund'],
  },
  other: {
    label: 'Other',
    icon: '📦',
    color: 'bg-gray-100 dark:bg-gray-900/30',
    keywords: [],
  },
};

// ---------------------------------------------------------------------------
// detectCategory
// ---------------------------------------------------------------------------

// Categories to check in priority order (more specific first)
const DETECTION_ORDER: Category[] = [
  'salary',
  'savings',
  'coffee',
  'fuel',
  'groceries',
  'restaurant',
  'subscriptions',
  'entertainment',
  'health',
  'transport',
  'bills',
  'football',
  'electronics',
  'shopping',
  'family',
  'other',
];

export function detectCategory(description: string): Category {
  const lower = description.toLowerCase();

  for (const category of DETECTION_ORDER) {
    const { keywords } = CATEGORY_CONFIG[category];
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }

  return 'other';
}

// ---------------------------------------------------------------------------
// detectType
// ---------------------------------------------------------------------------
const INCOME_KEYWORDS = ['salary', 'wage', 'income', 'paycheck', 'payment received', 'transfer in'];
const SAVINGS_KEYWORDS = ['savings', 'save', 'deposit', 'investment', 'fund'];

export function detectType(description: string, amount: number): TransactionType {
  const lower = description.toLowerCase();

  if (amount > 500 && INCOME_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'income';
  }

  if (SAVINGS_KEYWORDS.some((kw) => lower.includes(kw))) {
    return 'savings';
  }

  return 'expense';
}
