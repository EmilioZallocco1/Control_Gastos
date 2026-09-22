import { Wallet2, Receipt, TrendingUp, Layers } from 'lucide-react'
import { Card } from '../ui/Card'
import { CATEGORIES } from '../../utils/categories'
import { formatCurrency } from '../../utils/formatters'
import type { Expense } from '../../types/expense'

interface SummaryCardsProps {
  expenses: Expense[]
  daysElapsed: number
}

export function SummaryCards({ expenses, daysElapsed }: SummaryCardsProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const average = daysElapsed > 0 ? total / daysElapsed : 0

  const byCategory = new Map<string, number>()
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount)
  }
  const topCategoryEntry = [...byCategory.entries()].sort((a, b) => b[1] - a[1])[0]
  const topCategory = topCategoryEntry ? CATEGORIES[topCategoryEntry[0] as keyof typeof CATEGORIES] : null

  const items = [
    {
      label: 'Total del mes',
      value: formatCurrency(total),
      icon: Wallet2,
      iconBg: 'bg-brand-50',
      iconColor: 'text-brand-600',
    },
    {
      label: 'Promedio diario',
      value: formatCurrency(average),
      icon: TrendingUp,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Categoría principal',
      value: topCategory ? topCategory.label : '—',
      icon: Layers,
      iconBg: topCategory ? topCategory.bg : 'bg-slate-100',
      iconColor: topCategory ? topCategory.text : 'text-slate-500',
    },
    {
      label: 'Gastos registrados',
      value: String(expenses.length),
      icon: Receipt,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="flex items-center gap-3.5">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg} ${item.iconColor}`}>
            <item.icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-400">{item.label}</p>
            <p className="truncate text-lg font-bold text-slate-800">{item.value}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
