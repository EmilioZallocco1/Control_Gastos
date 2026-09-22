import { Pencil, Send, Trash2 } from 'lucide-react'
import { CATEGORIES } from '../../utils/categories'
import { formatCurrency, formatDayMonth } from '../../utils/formatters'
import type { Expense } from '../../types/expense'

interface ExpenseItemProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export function ExpenseItem({ expense, onEdit, onDelete }: ExpenseItemProps) {
  const meta = CATEGORIES[expense.category]
  const Icon = meta.icon

  return (
    <div className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.bg} ${meta.text}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-700">
          {expense.description}
          {expense.source === 'telegram' && (
            <span title="Agregado desde Telegram" className="inline-flex shrink-0">
              <Send size={12} className="text-sky-500" />
            </span>
          )}
        </p>
        <p className="text-xs text-slate-400">
          {meta.label} · {formatDayMonth(expense.date)}
        </p>
      </div>
      <span className="shrink-0 text-sm font-bold text-slate-800">
        {formatCurrency(expense.amount)}
      </span>
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => onEdit(expense)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/70 hover:text-slate-600"
          aria-label="Editar gasto"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={() => onDelete(expense.id)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-500"
          aria-label="Eliminar gasto"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
