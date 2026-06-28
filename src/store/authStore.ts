'use client'

import { create } from 'zustand'
import { User, USERS, getCurrentUser, login as authLogin, logout as authLogout } from '@/lib/auth'

interface AuthState {
  user: User | null
  isLoading: boolean
  init: () => void
  login: (userId: string, pin: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  init: () => {
    const user = getCurrentUser()
    set({ user, isLoading: false })
  },

  login: (userId, pin) => {
    const ok = authLogin(userId, pin)
    if (ok) {
      const user = USERS.find(u => u.id === userId) ?? null
      set({ user })
    }
    return ok
  },

  logout: () => {
    authLogout()
    set({ user: null })
  },
}))
