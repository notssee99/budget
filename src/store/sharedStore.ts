'use client'

import { create } from 'zustand'
import type { SharedSavingsGoal, SharedContribution } from '@/types'
import * as db from '@/lib/db'

const id = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

interface SharedState {
  goals: SharedSavingsGoal[]
  isLoaded: boolean
  loadShared: () => Promise<void>
  addGoal: (g: Omit<SharedSavingsGoal, 'id' | 'createdAt' | 'contributions'>) => void
  updateGoal: (goalId: string, updates: Partial<Omit<SharedSavingsGoal, 'contributions'>>) => void
  deleteGoal: (goalId: string) => void
  addContribution: (goalId: string, contrib: Omit<SharedContribution, 'id'>) => void
  deleteContribution: (goalId: string, contribId: string) => void
}

export const useSharedStore = create<SharedState>()((set, get) => ({
  goals: [],
  isLoaded: false,

  loadShared: async () => {
    try {
      const goals = await db.getSharedGoals()
      set({ goals, isLoaded: true })
    } catch {
      set({ isLoaded: true })
    }
  },

  addGoal: (g) => {
    const newGoal: SharedSavingsGoal = {
      ...g, id: id(), createdAt: new Date().toISOString(), contributions: [],
    }
    set(state => ({ goals: [...state.goals, newGoal] }))
    db.insertSharedGoal(newGoal)
  },

  updateGoal: (goalId, updates) => {
    set(state => ({
      goals: state.goals.map(g => g.id === goalId ? { ...g, ...updates } : g),
    }))
    db.dbUpdateSharedGoal(goalId, updates)
  },

  deleteGoal: (goalId) => {
    set(state => ({ goals: state.goals.filter(g => g.id !== goalId) }))
    db.dbDeleteSharedGoal(goalId)
  },

  addContribution: (goalId, contrib) => {
    const newContrib: SharedContribution = { ...contrib, id: id() }
    set(state => ({
      goals: state.goals.map(g =>
        g.id === goalId ? { ...g, contributions: [...g.contributions, newContrib] } : g
      ),
    }))
    db.insertSharedContribution(goalId, newContrib)
  },

  deleteContribution: (goalId, contribId) => {
    set(state => ({
      goals: state.goals.map(g =>
        g.id === goalId
          ? { ...g, contributions: g.contributions.filter(c => c.id !== contribId) }
          : g
      ),
    }))
    db.dbDeleteSharedContribution(contribId)
  },
}))
