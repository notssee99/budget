'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { USERS, User } from '@/lib/auth'
import { useAuthStore } from '@/store/authStore'
import { useFinanceStore } from '@/store/financeStore'

export function LoginScreen() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const authLogin = useAuthStore(s => s.login)
  const loadForUser = useFinanceStore(s => s.loadForUser)

  function selectUser(user: User) {
    setSelectedUser(user)
    setPin('')
    setError('')
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleBack() {
    setSelectedUser(null)
    setPin('')
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedUser) return
    const ok = authLogin(selectedUser.id, pin)
    if (ok) {
      await loadForUser(selectedUser.id)
    } else {
      setError('PIN i gabuar. Provo sërish.')
      setPin('')
      setShaking(true)
      setTimeout(() => setShaking(false), 500)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handlePinKey(digit: string) {
    if (pin.length < 8) setPin(p => p + digit)
  }

  function handlePinDelete() {
    setPin(p => p.slice(0, -1))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-6">
      {/* Logo / title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center"
      >
        <div className="text-4xl mb-3">💰</div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">BudgetApp</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Zgjidh përdoruesin tënd</p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!selectedUser ? (
          /* User selection */
          <motion.div
            key="select"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex gap-5"
          >
            {USERS.map((user, i) => (
              <motion.button
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectUser(user)}
                className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-white dark:bg-zinc-800 shadow-lg shadow-zinc-200/60 dark:shadow-zinc-950/60 border border-zinc-200/60 dark:border-zinc-700/60 w-40 cursor-pointer transition-shadow hover:shadow-xl"
              >
                <span className="text-6xl">{user.avatar}</span>
                <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : (
          /* PIN entry */
          <motion.div
            key="pin"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="w-full max-w-xs"
          >
            {/* Back + user header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleBack}
                className="p-2 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedUser.avatar}</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{selectedUser.name}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* PIN dots + input */}
              <motion.div
                animate={shaking ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                {/* Visual dots */}
                <div className="flex justify-center gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full transition-all duration-150 ${
                        i < pin.length
                          ? 'bg-indigo-500 scale-110'
                          : 'bg-zinc-300 dark:bg-zinc-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Hidden text input (accessible, allows typing) */}
                <div className="relative">
                  <input
                    ref={inputRef}
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={8}
                    value={pin}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 8)
                      setPin(val)
                      setError('')
                    }}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3 text-center text-lg font-mono tracking-widest text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="PIN (8 shifra)"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-sm text-red-500"
                  >
                    {error}
                  </motion.p>
                )}
              </motion.div>

              {/* Numpad */}
              <div className="grid grid-cols-3 gap-3">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((key, i) => {
                  if (key === '') return <div key={i} />
                  return (
                    <button
                      key={i}
                      type={key === '⌫' ? 'button' : 'button'}
                      onClick={() => key === '⌫' ? handlePinDelete() : handlePinKey(key)}
                      className="h-14 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 text-xl font-medium text-zinc-900 dark:text-zinc-100 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-95 transition-all"
                    >
                      {key}
                    </button>
                  )
                })}
              </div>

              <button
                type="submit"
                disabled={pin.length < 8}
                className="w-full h-12 rounded-xl bg-indigo-600 text-white font-semibold text-base hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-98"
              >
                Hyr
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
