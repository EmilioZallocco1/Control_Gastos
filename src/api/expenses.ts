import type { Expense, ExpenseInput } from '../types/expense'

const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`Error ${res.status} al llamar ${path}`)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export function fetchExpenses(): Promise<Expense[]> {
  return request<Expense[]>('/api/expenses')
}

export function createExpense(input: ExpenseInput): Promise<Expense> {
  return request<Expense>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateExpenseRequest(id: string, input: ExpenseInput): Promise<Expense> {
  return request<Expense>(`/api/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}

export function deleteExpenseRequest(id: string): Promise<void> {
  return request<void>(`/api/expenses/${id}`, { method: 'DELETE' })
}
