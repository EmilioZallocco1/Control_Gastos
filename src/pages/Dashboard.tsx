import { useMemo, useState } from 'react'
import { Header } from '../components/layout/Header'
import { MonthSelector } from '../components/dashboard/MonthSelector'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { CategoryChart } from '../components/dashboard/CategoryChart'
import { TrendChart } from '../components/dashboard/TrendChart'
import { ExpenseList } from '../components/expenses/ExpenseList'
import { ExpenseForm } from '../components/expenses/ExpenseForm'
import { useExpenses } from '../context/ExpensesContext'
import type { Expense } from '../types/expense'

export function Dashboard() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [formOpen, setFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const monthlyExpenses = useMemo(
    () =>
      expenses.filter((e) => {
        const [ey, em] = e.date.split('-').map(Number)
        return ey === year && em - 1 === month
      }),
    [expenses, year, month],
  )

  const daysElapsed = useMemo(() => {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth()
    return isCurrentMonth ? now.getDate() : new Date(year, month + 1, 0).getDate()
  }, [year, month])

  const openCreateForm = () => {
    setEditingExpense(null)
    setFormOpen(true)
  }

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense)
    setFormOpen(true)
  }

  const handleSubmit = (input: Parameters<typeof addExpense>[0]) => {
    if (editingExpense) {
      updateExpense(editingExpense.id, input)
    } else {
      addExpense(input)
    }
    setFormOpen(false)
    setEditingExpense(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este gasto?')) deleteExpense(id)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <Header onAddClick={openCreateForm} />

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h2 className="text-sm font-semibold text-slate-400">Resumen del mes</h2>
        <MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
      </div>

      <SummaryCards expenses={monthlyExpenses} daysElapsed={daysElapsed} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <CategoryChart expenses={monthlyExpenses} />
        <TrendChart expenses={expenses} year={year} month={month} />
      </div>

      <ExpenseList expenses={monthlyExpenses} onEdit={openEditForm} onDelete={handleDelete} />

      <ExpenseForm
        key={editingExpense?.id ?? 'new'}
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingExpense(null) }}
        onSubmit={handleSubmit}
        initialExpense={editingExpense}
      />
    </div>
  )
}
