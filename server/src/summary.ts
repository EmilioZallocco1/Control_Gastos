import { getAll } from './store.js'
import type { CategoryId } from './types.js'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function getTodayTotal(): Promise<number> {
  const today = todayIso()
  const expenses = await getAll()
  return expenses.filter((e) => e.date === today).reduce((sum, e) => sum + e.amount, 0)
}

export async function getMonthlyTotal(): Promise<{
  total: number
  byCategory: Partial<Record<CategoryId, number>>
}> {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const expenses = await getAll()

  const byCategory: Partial<Record<CategoryId, number>> = {}
  let total = 0

  for (const e of expenses) {
    const [ey, em] = e.date.split('-').map(Number)
    if (ey !== year || em - 1 !== month) continue
    total += e.amount
    byCategory[e.category] = (byCategory[e.category] ?? 0) + e.amount
  }

  return { total, byCategory }
}
