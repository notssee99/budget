import { cn } from '@/lib/utils'
import { CATEGORY_CONFIG } from '@/lib/categoryDetection'
import type { Category } from '@/types'

interface CategoryIconProps {
  category: Category
  size?: 'sm' | 'md' | 'lg'
  showBackground?: boolean
}

const SIZE_CLASSES = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
} as const

const CONTAINER_SIZES = {
  sm: 'w-7 h-7',
  md: 'w-9 h-9',
  lg: 'w-12 h-12',
} as const

export function CategoryIcon({
  category,
  size = 'md',
  showBackground = false,
}: CategoryIconProps) {
  const config = CATEGORY_CONFIG[category]

  if (showBackground) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-xl flex-shrink-0',
          CONTAINER_SIZES[size],
          config.color,
        )}
        aria-label={config.label}
      >
        <span className={SIZE_CLASSES[size]} role="img" aria-hidden="true">
          {config.icon}
        </span>
      </span>
    )
  }

  return (
    <span
      className={cn(SIZE_CLASSES[size], 'leading-none')}
      role="img"
      aria-label={config.label}
    >
      {config.icon}
    </span>
  )
}
