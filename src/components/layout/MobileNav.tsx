'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Receipt, Landmark, Users, CalendarClock, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', icon: Home,          href: '/' },
  { label: 'Expenses',  icon: Receipt,       href: '/expenses' },
  { label: 'Fikse',     icon: CalendarClock, href: '/fixed' },
  { label: 'Kursimet',  icon: Landmark,      href: '/accounts' },
  { label: 'Bashkë',   icon: Users,         href: '/shared' },
  { label: 'Settings',  icon: Settings,      href: '/settings' },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 border-t border-border bg-card overflow-x-auto">
      <div className="flex h-full min-w-max px-1">
        {NAV.map(({ label, icon: Icon, href }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-4 text-[10px] font-medium transition-colors whitespace-nowrap',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
