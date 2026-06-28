'use client'

import { useEffect } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applyTheme = () => {
      let theme = 'system'
      try {
        const raw = localStorage.getItem('finance-store')
        if (raw) {
          const parsed = JSON.parse(raw)
          theme = parsed?.state?.settings?.theme ?? 'system'
        }
      } catch {
        // ignore parse errors
      }

      const root = document.documentElement
      root.classList.remove('light', 'dark')

      if (theme === 'light') {
        root.classList.add('light')
      } else if (theme === 'dark') {
        root.classList.add('dark')
      } else {
        // system
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) root.classList.add('dark')
      }
    }

    applyTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', applyTheme)
    return () => mediaQuery.removeEventListener('change', applyTheme)
  }, [])

  return <>{children}</>
}
