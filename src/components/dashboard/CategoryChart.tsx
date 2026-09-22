import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '../ui/Card'
import { CATEGORIES } from '../../utils/categories'
import { formatCurrency } from '../../utils/formatters'
import type { Expense } from '../../types/expense'
import type { CategoryId } from '../../types/expense'

interface CategoryChartProps {
  expenses: Expense[]
}

export function CategoryChart({ expenses }: CategoryChartProps) {
  const totals = new Map<CategoryId, number>()
  for (const e of expenses) {
    totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount)
  }

  const data = [...totals.entries()]
    .map(([category, value]) => ({
      category,
      label: CATEGORIES[category].label,
      value,
      color: CATEGORIES[category].color,
    }))
    .sort((a, b) => b.value - a.value)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <Card>
      <h3 className="mb-1 text-sm font-bold text-slate-700">Gastos por categoría</h3>
      <p className="mb-4 text-xs text-slate-400">Distribución del mes seleccionado</p>

      {data.length === 0 ? (
        <div className="flex h-52 items-center justify-center text-sm text-slate-400">
          Todavía no hay gastos este mes
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative h-48 w-48 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry) => (
                    <Cell key={entry.category} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 8px 24px -8px rgb(16 24 60 / 0.15)',
                    fontSize: 13,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-sm font-bold text-slate-800">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2">
            {data.map((entry) => (
              <div key={entry.category} className="flex items-center justify-between gap-2 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="truncate text-slate-600">{entry.label}</span>
                </div>
                <span className="shrink-0 font-semibold text-slate-800">
                  {formatCurrency(entry.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
