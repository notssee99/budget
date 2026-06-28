'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Receipt, Target, BarChart2, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', icon: Home,      href: '/' },
  { label: 'Expenses',  icon: Receipt,   href: '/expenses' },
  { label: 'Goals',     icon: Target,    href: '/goals' },
  { label: 'Bashkë',   icon: Users,     href: '/shared' },
  { label: 'Stats',     icon: BarChart2, href: '/statistics' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 flex h-16 border-t border-border bg-card">
      {NAV.map(({ label, icon: Icon, href }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
