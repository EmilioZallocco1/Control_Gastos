import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-xl2 border border-slate-100 bg-surface p-5 shadow-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  )
}
