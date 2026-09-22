import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { Card } from '../ui/Card'
import { formatCurrency, formatMonthShort } from '../../utils/formatters'
import type { Expense } from '../../types/expense'

interface TrendChartProps {
  expenses: Expense[]
  year: number
  month: number
  monthsBack?: number
}

export function TrendChart({ expenses, year, month, monthsBack = 6 }: TrendChartProps) {
  const data = Array.from({ length: monthsBack }, (_, i) => {
    const offset = monthsBack - 1 - i
    const date = new Date(year, month - offset, 1)
    const y = date.getFullYear()
    const m = date.getMonth()
    const total = expenses
      .filter((e) => {
        const [ey, em] = e.date.split('-').map(Number)
        return ey === y && em - 1 === m
      })
      .reduce((sum, e) => sum + e.amount, 0)
    return {
      name: formatMonthShort(y, m),
      total,
      isSelected: y === year && m === month,
    }
  })

  return (
    <Card>
      <h3 className="mb-1 text-sm font-bold text-slate-700">Tendencia</h3>
      <p className="mb-4 text-xs text-slate-400">Últimos {monthsBack} meses</p>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
              width={40}
            />
            <Tooltip
              cursor={{ fill: '#f8fafc' }}
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                borderRadius: 12,
                border: '1px solid #f1f5f9',
                boxShadow: '0 8px 24px -8px rgb(16 24 60 / 0.15)',
                fontSize: 13,
              }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={36}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.isSelected ? '#5b6ff5' : '#e2e8f0'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
