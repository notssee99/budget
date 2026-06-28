import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG } from '@/lib/categoryDetection'
import type { Category } from '@/types'

interface CategoryBadgeProps {
  category: Category
  className?: string
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  const config = CATEGORY_CONFIG[category]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5',
        'text-xs font-medium leading-none',
        config.color,
        className,
      )}
    >
      <span role="img" aria-hidden="true" className="text-sm leading-none">
        {config.icon}
      </span>
      {config.label}
    </span>
  )
}
