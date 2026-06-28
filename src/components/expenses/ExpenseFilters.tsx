'use client'

import { useState, useCallback, useEffect } from 'react'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { CategoryBadge } from '@/components/shared/CategoryBadge'

import { CATEGORY_CONFIG } from '@/lib/categoryDetection'
import { cn } from '@/lib/utils'
import type { Category, TransactionType } from '@/types'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SortField = 'date' | 'amount' | 'description'
export type SortDir = 'asc' | 'desc'

export interface ExpenseFilters {
  search: string
  categories: Category[]
  type: TransactionType | 'all'
  dateFrom: string
  dateTo: string
  sortBy: SortField
  sortDir: SortDir
}

const DEFAULT_FILTERS: ExpenseFilters = {
  search: '',
  categories: [],
  type: 'all',
  dateFrom: '',
  dateTo: '',
  sortBy: 'date',
  sortDir: 'desc',
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExpenseFiltersProps {
  onFiltersChange: (filters: ExpenseFilters) => void
}

// ---------------------------------------------------------------------------
// All categories for the multi-select
// ---------------------------------------------------------------------------

const ALL_CATEGORIES = Object.keys(CATEGORY_CONFIG) as Category[]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExpenseFilters({ onFiltersChange }: ExpenseFiltersProps) {
  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_FILTERS)
  const [categoryOpen, setCategoryOpen] = useState(false)

  const update = useCallback(
    (patch: Partial<ExpenseFilters>) => {
      setFilters((prev) => {
        const next = { ...prev, ...patch }
        onFiltersChange(next)
        return next
      })
    },
    [onFiltersChange],
  )

  // Emit defaults on mount
  useEffect(() => {
    onFiltersChange(DEFAULT_FILTERS)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleCategory = useCallback(
    (cat: Category) => {
      const next = filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat]
      update({ categories: next })
    },
    [filters.categories, update],
  )

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    onFiltersChange(DEFAULT_FILTERS)
    setCategoryOpen(false)
  }, [onFiltersChange])

  const hasActiveFilters =
    filters.search ||
    filters.categories.length > 0 ||
    filters.type !== 'all' ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.sortBy !== 'date' ||
    filters.sortDir !== 'desc'

  return (
    <div className="space-y-3">
      {/* Row 1: search + type + sort */}
      <div className="flex flex-wrap gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search transactions…"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-9 h-9 text-sm"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update({ search: '' })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Type filter */}
        <Select value={filters.type} onValueChange={(v) => update({ type: v as ExpenseFilters['type'] })}>
          <SelectTrigger className="h-9 w-[130px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="expense">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Expenses
              </span>
            </SelectItem>
            <SelectItem value="income">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Income
              </span>
            </SelectItem>
            <SelectItem value="savings">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
                Savings
              </span>
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={`${filters.sortBy}-${filters.sortDir}`}
          onValueChange={(v) => {
            const [field, dir] = v.split('-') as [SortField, SortDir]
            update({ sortBy: field, sortDir: dir })
          }}
        >
          <SelectTrigger className="h-9 w-[160px] text-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Date: Newest first</SelectItem>
            <SelectItem value="date-asc">Date: Oldest first</SelectItem>
            <SelectItem value="amount-desc">Amount: High to low</SelectItem>
            <SelectItem value="amount-asc">Amount: Low to high</SelectItem>
            <SelectItem value="description-asc">Description: A–Z</SelectItem>
            <SelectItem value="description-desc">Description: Z–A</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-9 text-muted-foreground hover:text-foreground gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Reset
          </Button>
        )}
      </div>

      {/* Row 2: date range + category picker */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Date from */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">From</span>
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => update({ dateFrom: e.target.value })}
            className="h-8 w-[136px] text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">To</span>
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => update({ dateTo: e.target.value })}
            className="h-8 w-[136px] text-xs"
          />
        </div>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        {/* Category picker */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => setCategoryOpen((v) => !v)}
          >
            Categories
            {filters.categories.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-[10px] h-4">
                {filters.categories.length}
              </Badge>
            )}
            <ChevronDown className={cn('w-3.5 h-3.5 text-muted-foreground transition-transform', categoryOpen && 'rotate-180')} />
          </Button>

          {categoryOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setCategoryOpen(false)}
              />
              <div className="absolute top-full mt-1.5 left-0 z-20 bg-popover border border-border rounded-lg shadow-lg p-3 w-72">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Filter by category
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((cat) => {
                    const active = filters.categories.includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={cn(
                          'transition-opacity',
                          !active && 'opacity-40 hover:opacity-70',
                        )}
                      >
                        <CategoryBadge category={cat} />
                      </button>
                    )
                  })}
                </div>
                {filters.categories.length > 0 && (
                  <button
                    type="button"
                    onClick={() => update({ categories: [] })}
                    className="mt-2.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear categories
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* Active category chips */}
        {filters.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {filters.categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => toggleCategory(cat)}
                className="group flex items-center gap-1 hover:opacity-70 transition-opacity"
                aria-label={`Remove ${cat} filter`}
              >
                <CategoryBadge category={cat} />
                <X className="w-3 h-3 text-muted-foreground group-hover:text-foreground" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
