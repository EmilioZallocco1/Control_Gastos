import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonthYear } from '../../utils/formatters'

interface MonthSelectorProps {
  year: number
  month: number
  onChange: (year: number, month: number) => void
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const goTo = (delta: number) => {
    const date = new Date(year, month + delta, 1)
    onChange(date.getFullYear(), date.getMonth())
  }

  const isCurrentMonth = (() => {
    const now = new Date()
    return now.getFullYear() === year && now.getMonth() === month
  })()

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-100 bg-surface p-1 shadow-soft">
      <button
        onClick={() => goTo(-1)}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
        aria-label="Mes anterior"
      >
        <ChevronLeft size={18} />
      </button>
      <span className="min-w-[9.5rem] text-center text-sm font-semibold text-slate-700">
        {formatMonthYear(year, month)}
      </span>
      <button
        onClick={() => goTo(1)}
        disabled={isCurrentMonth}
        className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        aria-label="Mes siguiente"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
