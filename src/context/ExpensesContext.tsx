import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createExpense,
  deleteExpenseRequest,
  fetchExpenses,
  updateExpenseRequest,
} from '../api/expenses'
import type { Expense, ExpenseInput } from '../types/expense'

const POLL_INTERVAL_MS = 8000

interface ExpensesContextValue {
  expenses: Expense[]
  loading: boolean
  error: string | null
  addExpense: (input: ExpenseInput) => Promise<void>
  updateExpense: (id: string, input: ExpenseInput) => Promise<void>
  deleteExpense: (id: string) => Promise<void>
}

const ExpensesContext = createContext<ExpensesContextValue | undefined>(undefined)

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      try {
        const data = await fetchExpenses()
        if (cancelled) return
        setExpenses(data)
        setError(null)
      } catch {
        if (cancelled) return
        setError('No se pudo conectar con el servidor. ¿Está corriendo? (npm run dev en /server)')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    refresh()
    const interval = setInterval(refresh, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const value = useMemo<ExpensesContextValue>(
    () => ({
      expenses,
      loading,
      error,
      addExpense: async (input) => {
        const expense = await createExpense(input)
        setExpenses((prev) => [expense, ...prev])
      },
      updateExpense: async (id, input) => {
        const updated = await updateExpenseRequest(id, input)
        setExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)))
      },
      deleteExpense: async (id) => {
        await deleteExpenseRequest(id)
        setExpenses((prev) => prev.filter((e) => e.id !== id))
      },
    }),
    [expenses, loading, error],
  )

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext)
  if (!ctx) throw new Error('useExpenses debe usarse dentro de ExpensesProvider')
  return ctx
}
