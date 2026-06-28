# BudgetApp - Personal Finance Manager

> A beautiful, privacy-first personal finance app built with Next.js 15. Track expenses, set savings goals, analyze spending patterns, and take control of your finances — all stored locally in your browser.

![BudgetApp Dashboard](https://via.placeholder.com/1200x630/0f172a/38bdf8?text=BudgetApp+Dashboard+Screenshot)

> **Screenshots placeholder** — replace the image above with actual screenshots after deployment.

---

## Features

### Core Modules

- **Dashboard** — Monthly overview with income, expenses, savings rate, and at-a-glance category breakdown
- **Expenses** — Log, edit, and delete transactions with category tagging and notes
- **Fixed Expenses** — Manage recurring monthly costs (rent, subscriptions, utilities) separately from variable spending
- **Savings Goals** — Create goals with target amounts and deadlines; track progress with visual indicators
- **Statistics** — Interactive charts showing spending trends, category distributions, and month-over-month comparisons
- **Calendar View** — See expenses laid out day-by-day on a monthly calendar
- **Reports** — Generate monthly and yearly summaries with exportable breakdowns
- **Insights** — AI-style spending pattern analysis and budget recommendations

### UX & Productivity

- **Quick Add** — Keyboard-triggered expense entry from anywhere in the app
- **Privacy Mode** — Blur all monetary values with one toggle for public use
- **Keyboard Shortcuts** — Full keyboard navigation for power users (see [Keyboard Shortcuts](#keyboard-shortcuts))
- **Dark / Light Mode** — System-aware theme with manual override
- **Responsive Design** — Works on mobile, tablet, and desktop

### Technical

- **PWA Ready** — Installable as a Progressive Web App on mobile and desktop
- **Offline First** — All data stored in `localStorage`; works without internet
- **Export / Import** — Back up and restore your data as JSON
- **Zero Account Required** — No sign-up, no tracking, no server calls (v1)

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| UI Components | [shadcn/ui](https://ui.shadcn.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| Charts | [Recharts](https://recharts.org/) |
| State Management | [Zustand](https://zustand-demo.pmnd.rs/) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Date Utilities | [date-fns](https://date-fns.org/) |
| Storage (v1) | Browser `localStorage` |
| Storage (v2) | [Supabase](https://supabase.com/) *(planned)* |
| Deployment | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites

- **Node.js** 18 or higher — [download](https://nodejs.org/)
- **npm**, **yarn**, or **pnpm**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/budgetapp.git
cd budgetapp

# 2. Install dependencies
npm install
# or
yarn install
# or
pnpm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

For v1 (localStorage only), no environment variables are required. Create a `.env.local` file only when adding Supabase in v2:

```bash
# .env.local (v2 only — not needed for v1)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Build & Deploy

### Vercel Deployment (Recommended)

The fastest way to deploy BudgetApp is with [Vercel](https://vercel.com/), the platform built by the creators of Next.js.

**Option A — Deploy with one click:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/budgetapp)

**Option B — Manual Vercel deployment:**

```bash
# 1. Install the Vercel CLI
npm install -g vercel

# 2. Log in to your Vercel account
vercel login

# 3. Deploy (follow the prompts)
vercel

# 4. Deploy to production
vercel --prod
```

**Option C — Via the Vercel dashboard:**

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub / GitLab / Bitbucket repository
3. Vercel auto-detects Next.js — no configuration needed
4. Click **Deploy**
5. Your app is live at `https://your-project.vercel.app`

### Self-Hosted

```bash
# Build the production bundle
npm run build

# Start the production server
npm run start
```

The app runs on port `3000` by default. Use a reverse proxy (nginx, Caddy) to serve it on port 80/443.

**Docker (optional):**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t budgetapp .
docker run -p 3000:3000 budgetapp
```

---

## Folder Structure

```
budgetapp/
├── public/                     # Static assets
│   ├── icons/                  # PWA icons (192x192, 512x512)
│   ├── manifest.json           # PWA manifest
│   └── favicon.ico
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (theme provider, fonts)
│   │   ├── page.tsx            # Dashboard (/)
│   │   ├── expenses/
│   │   │   └── page.tsx        # Expenses list and entry
│   │   ├── goals/
│   │   │   └── page.tsx        # Savings goals
│   │   ├── statistics/
│   │   │   └── page.tsx        # Charts and analytics
│   │   ├── calendar/
│   │   │   └── page.tsx        # Calendar view
│   │   ├── reports/
│   │   │   └── page.tsx        # Monthly / yearly reports
│   │   ├── insights/
│   │   │   └── page.tsx        # Spending insights
│   │   └── settings/
│   │       └── page.tsx        # App configuration
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx     # Navigation sidebar
│   │   │   ├── Header.tsx      # Top bar with quick actions
│   │   │   └── MobileNav.tsx   # Bottom nav for mobile
│   │   ├── dashboard/
│   │   │   ├── SummaryCards.tsx
│   │   │   ├── SpendingChart.tsx
│   │   │   └── RecentExpenses.tsx
│   │   ├── expenses/
│   │   │   ├── ExpenseForm.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   └── ExpenseCard.tsx
│   │   ├── goals/
│   │   │   ├── GoalCard.tsx
│   │   │   └── GoalForm.tsx
│   │   ├── charts/
│   │   │   ├── CategoryPieChart.tsx
│   │   │   ├── MonthlyBarChart.tsx
│   │   │   └── TrendLineChart.tsx
│   │   └── common/
│   │       ├── QuickAdd.tsx    # Global quick-add overlay
│   │       ├── PrivacyToggle.tsx
│   │       └── ExportImport.tsx
│   │
│   ├── store/                  # Zustand state stores
│   │   ├── budgetStore.ts      # Budget months and totals
│   │   ├── expenseStore.ts     # Expenses CRUD
│   │   ├── goalStore.ts        # Savings goals
│   │   └── settingsStore.ts    # User preferences
│   │
│   ├── lib/
│   │   ├── storage.ts          # localStorage read/write abstraction
│   │   ├── calculations.ts     # Budget math utilities
│   │   ├── exportImport.ts     # JSON export/import helpers
│   │   └── utils.ts            # shadcn/ui cn() helper + misc
│   │
│   ├── hooks/
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── usePrivacyMode.ts
│   │   └── useMonthNavigation.ts
│   │
│   ├── types/
│   │   └── index.ts            # Shared TypeScript types and interfaces
│   │
│   └── styles/
│       └── globals.css         # Tailwind base + CSS variables
│
├── .env.local                  # Local environment variables (gitignored)
├── .env.example                # Environment variable template
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
├── components.json             # shadcn/ui configuration
└── package.json
```

---

## Configuration

All configuration is done through the **Settings page** at `/settings`. No config files need to be edited manually.

### Available Settings

| Setting | Description | Default |
|---|---|---|
| Monthly Salary | Your net monthly income | — |
| Default Currency | Currency symbol displayed throughout the app | $ |
| Default Budget Limits | Per-category spending caps | — |
| Week Start Day | First day of the week in calendar view | Monday |
| Theme | Light, dark, or system | System |
| Privacy Mode Default | Start with values blurred | Off |

### Category Management

Add, rename, and reorder expense categories from **Settings → Categories**. Each category can have a custom color and icon for chart clarity.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Q` | Open Quick Add expense dialog |
| `N` | New expense (on Expenses page) |
| `G` | New savings goal (on Goals page) |
| `P` | Toggle Privacy Mode |
| `?` | Show keyboard shortcuts help |
| `←` / `→` | Navigate previous / next month |
| `Esc` | Close any open dialog |
| `Ctrl + E` | Export data as JSON |
| `Ctrl + ,` | Open Settings |
| `1` – `8` | Jump to page (Dashboard, Expenses, Goals, Statistics, Calendar, Reports, Insights, Settings) |

---

## Data & Privacy

### Where Your Data Lives

All data in v1 is stored exclusively in your browser's `localStorage`. **No data is ever sent to any server.** There are no analytics, no telemetry, and no third-party scripts that touch your financial information.

```
localStorage keys:
  budgetapp_settings        → app preferences
  budgetapp_expenses        → all expense records
  budgetapp_fixed_expenses  → recurring fixed costs
  budgetapp_goals           → savings goals
  budgetapp_budget_months   → per-month budget data
```

### Export Your Data

Go to **Settings → Data → Export** to download a complete JSON backup of all your data.

```json
{
  "exportedAt": "2026-06-27T10:00:00.000Z",
  "version": "1.0",
  "settings": { ... },
  "expenses": [ ... ],
  "fixedExpenses": [ ... ],
  "goals": [ ... ],
  "budgetMonths": [ ... ]
}
```

### Import Data

Go to **Settings → Data → Import** and select a previously exported JSON file. Existing data can be merged or replaced.

### Clear All Data

Go to **Settings → Data → Clear All Data**. This permanently removes everything from localStorage. Export first if you want a backup.

---

## Future: Supabase Migration

Version 2 will add cloud sync and multi-device support via Supabase. The codebase is architected with a `StorageService` abstraction so the migration only requires swapping the implementation — no component changes needed.

### Step 1 — Install Supabase

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
```

### Step 2 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Copy your **Project URL** and **Anon Key** from Project Settings → API
3. Add them to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Step 3 — Create the Database Schema

Run the following SQL in the Supabase SQL Editor:

```sql
-- Enable Row Level Security
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- Settings
create table public.settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  monthly_salary numeric(12,2) default 0,
  currency text default '$',
  theme text default 'system',
  privacy_mode_default boolean default false,
  week_start_day smallint default 1,
  categories jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- Budget months
create table public.budget_months (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  year smallint not null,
  month smallint not null,
  income numeric(12,2) default 0,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, year, month)
);

-- Expenses
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  category text not null,
  description text,
  date date not null,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Fixed expenses (recurring)
create table public.fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  amount numeric(12,2) not null,
  category text not null,
  description text not null,
  billing_day smallint default 1,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Savings goals
create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric(12,2) not null,
  current_amount numeric(12,2) default 0,
  deadline date,
  icon text,
  color text,
  completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security policies
alter table settings enable row level security;
alter table budget_months enable row level security;
alter table expenses enable row level security;
alter table fixed_expenses enable row level security;
alter table savings_goals enable row level security;

-- Each user can only see and modify their own data
create policy "Users own their settings" on settings for all using (auth.uid() = user_id);
create policy "Users own their budget_months" on budget_months for all using (auth.uid() = user_id);
create policy "Users own their expenses" on expenses for all using (auth.uid() = user_id);
create policy "Users own their fixed_expenses" on fixed_expenses for all using (auth.uid() = user_id);
create policy "Users own their savings_goals" on savings_goals for all using (auth.uid() = user_id);
```

### Step 4 — Implement the Supabase StorageService

Replace `src/lib/storage.ts` with a Supabase implementation that satisfies the same `StorageService` interface:

```typescript
// src/lib/supabaseStorage.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { StorageService } from './storage'

export function createSupabaseStorageService(): StorageService {
  const supabase = createClientComponentClient()

  return {
    async getExpenses() {
      const { data } = await supabase.from('expenses').select('*').order('date', { ascending: false })
      return data ?? []
    },
    async saveExpense(expense) {
      await supabase.from('expenses').upsert(expense)
    },
    async deleteExpense(id) {
      await supabase.from('expenses').delete().eq('id', id)
    },
    // ... implement remaining methods
  }
}
```

### Step 5 — Add Authentication

```typescript
// src/app/layout.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SessionProvider } from '@/components/auth/SessionProvider'

export default async function RootLayout({ children }) {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

Enable **Email** and/or **OAuth providers** in Supabase Dashboard → Authentication → Providers.

### Step 6 — Migrate Existing Data

Use the built-in migration tool at **Settings → Data → Migrate to Cloud**:

1. Export your localStorage data as JSON (Settings → Data → Export)
2. Sign in to your account
3. Go to Settings → Data → Import from File
4. Select your exported JSON — the app will upload it to Supabase automatically

Or run the migration programmatically:

```typescript
// One-time migration script
const localData = JSON.parse(localStorage.getItem('budgetapp_expenses') ?? '[]')
const { error } = await supabase.from('expenses').insert(
  localData.map(expense => ({ ...expense, user_id: session.user.id }))
)
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository and create your feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Install dependencies** and start the dev server:
   ```bash
   npm install && npm run dev
   ```

3. **Make your changes** and ensure everything passes:
   ```bash
   npm run lint
   npm run type-check
   npm run build
   ```

4. **Commit** with a descriptive message:
   ```bash
   git commit -m "feat: add multi-currency support"
   ```

5. **Push** and open a Pull Request against `main`.

### Code Style

- TypeScript strict mode is enabled — no `any` types
- Components use named exports
- Zustand stores are in `src/store/`
- Shared types live in `src/types/index.ts`
- Use `date-fns` for all date manipulation
- Validate all form inputs with Zod schemas

### Reporting Issues

Please open a GitHub Issue with:
- A clear description of the bug or feature request
- Steps to reproduce (for bugs)
- Browser and OS version

---

## License

MIT License — see [LICENSE](./LICENSE) for details.

---

<p align="center">Built with Next.js, TypeScript, and a lot of care for your financial privacy.</p>
