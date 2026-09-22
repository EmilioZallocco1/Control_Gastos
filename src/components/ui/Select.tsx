import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
}

export function Select({ label, id, className = '', children, ...rest }: SelectProps) {
  const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={selectId} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <select
        id={selectId}
        className={`rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-shadow focus:border-brand-400 focus:ring-4 focus:ring-brand-100 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  )
}
