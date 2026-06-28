'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SharedSavingsGoal, SharedContribution } from '@/types'

const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

interface SharedState {
  goals: SharedSavingsGoal[]
  addGoal: (g: Omit<SharedSavingsGoal, 'id' | 'createdAt' | 'contributions'>) => void
  updateGoal: (goalId: string, updates: Partial<Omit<SharedSavingsGoal, 'contributions'>>) => void
  deleteGoal: (goalId: string) => void
  addContribution: (goalId: string, contrib: Omit<SharedContribution, 'id'>) => void
  deleteContribution: (goalId: string, contribId: string) => void
}

export const useSharedStore = create<SharedState>()(
  persist(
    (set) => ({
      goals: [],

      addGoal: (g) => {
        const newGoal: SharedSavingsGoal = {
          ...g,
          id: id(),
          createdAt: new Date().toISOString(),
          contributions: [],
        }
        set(state => ({ goals: [...state.goals, newGoal] }))
      },

      updateGoal: (goalId, updates) => {
        set(state => ({
          goals: state.goals.map(g => g.id === goalId ? { ...g, ...updates } : g),
        }))
      },

      deleteGoal: (goalId) => {
        set(state => ({ goals: state.goals.filter(g => g.id !== goalId) }))
      },

      addContribution: (goalId, contrib) => {
        const newContrib: SharedContribution = { ...contrib, id: id() }
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, contributions: [...g.contributions, newContrib] }
              : g
          ),
        }))
      },

      deleteContribution: (goalId, contribId) => {
        set(state => ({
          goals: state.goals.map(g =>
            g.id === goalId
              ? { ...g, contributions: g.contributions.filter(c => c.id !== contribId) }
              : g
          ),
        }))
      },
    }),
    {
      name: 'budgetapp_shared',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
        return localStorage
      }),
    }
  )
)
