import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type { Expense, ExpenseInput } from '../types/expense'

interface ExpensesContextValue {
  expenses: Expense[]
  addExpense: (input: ExpenseInput) => void
  updateExpense: (id: string, input: ExpenseInput) => void
  deleteExpense: (id: string) => void
}

const ExpensesContext = createContext<ExpensesContextValue | undefined>(undefined)

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('gastos:expenses', [])

  const value = useMemo<ExpensesContextValue>(
    () => ({
      expenses,
      addExpense: (input) => {
        const expense: Expense = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
        }
        setExpenses((prev) => [expense, ...prev])
      },
      updateExpense: (id, input) => {
        setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...input } : e)))
      },
      deleteExpense: (id) => {
        setExpenses((prev) => prev.filter((e) => e.id !== id))
      },
    }),
    [expenses, setExpenses],
  )

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext)
  if (!ctx) throw new Error('useExpenses debe usarse dentro de ExpensesProvider')
  return ctx
}
