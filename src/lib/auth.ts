export interface User {
  id: string
  name: string
  avatar: string
  pin: string
}

export const USERS: User[] = [
  { id: 'festoni', name: 'Festoni', avatar: '👨', pin: '12345678' },
  { id: 'odeta',   name: 'Odeta',   avatar: '👩', pin: '12345678' },
]

const SESSION_KEY = 'budgetapp_user'

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const id = sessionStorage.getItem(SESSION_KEY)
  return USERS.find(u => u.id === id) ?? null
}

export function login(userId: string, pin: string): boolean {
  const user = USERS.find(u => u.id === userId)
  if (!user || user.pin !== pin) return false
  sessionStorage.setItem(SESSION_KEY, userId)
  return true
}

export function logout(): void {
  if (typeof window !== 'undefined') sessionStorage.removeItem(SESSION_KEY)
}
