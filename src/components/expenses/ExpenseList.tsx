import { Inbox } from 'lucide-react'
import { Card } from '../ui/Card'
import { ExpenseItem } from './ExpenseItem'
import type { Expense } from '../../types/expense'

interface ExpenseListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  const sorted = [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)

  return (
    <Card>
      <h3 className="mb-1 text-sm font-bold text-slate-700">Movimientos</h3>
      <p className="mb-3 text-xs text-slate-400">{expenses.length} gasto(s) este mes</p>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-300">
          <Inbox size={32} />
          <p className="text-sm text-slate-400">No hay gastos cargados todavía</p>
        </div>
      ) : (
        <div className="styled-scroll -mx-2 flex max-h-[420px] flex-col divide-y divide-slate-50 overflow-y-auto px-2">
          {sorted.map((expense) => (
            <ExpenseItem key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </Card>
  )
}
