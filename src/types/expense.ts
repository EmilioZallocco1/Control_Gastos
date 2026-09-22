export type CategoryId =
  | 'comida'
  | 'transporte'
  | 'vivienda'
  | 'servicios'
  | 'entretenimiento'
  | 'salud'
  | 'educacion'
  | 'compras'
  | 'otros'

export interface Expense {
  id: string
  description: string
  amount: number
  category: CategoryId
  /** ISO date string, e.g. 2026-09-22 */
  date: string
  createdAt: number
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt'>
