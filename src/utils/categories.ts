import {
  UtensilsCrossed,
  Car,
  Home,
  Zap,
  Popcorn,
  HeartPulse,
  GraduationCap,
  ShoppingBag,
  CircleEllipsis,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryId } from '../types/expense'

export interface CategoryMeta {
  id: CategoryId
  label: string
  icon: LucideIcon
  color: string
  bg: string
  text: string
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  comida: {
    id: 'comida',
    label: 'Comida',
    icon: UtensilsCrossed,
    color: '#f97066',
    bg: 'bg-rose-50',
    text: 'text-rose-600',
  },
  transporte: {
    id: 'transporte',
    label: 'Transporte',
    icon: Car,
    color: '#3b82f6',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
  },
  vivienda: {
    id: 'vivienda',
    label: 'Vivienda',
    icon: Home,
    color: '#8b5cf6',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
  servicios: {
    id: 'servicios',
    label: 'Servicios',
    icon: Zap,
    color: '#f59e0b',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  entretenimiento: {
    id: 'entretenimiento',
    label: 'Entretenimiento',
    icon: Popcorn,
    color: '#ec4899',
    bg: 'bg-pink-50',
    text: 'text-pink-600',
  },
  salud: {
    id: 'salud',
    label: 'Salud',
    icon: HeartPulse,
    color: '#10b981',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  educacion: {
    id: 'educacion',
    label: 'Educación',
    icon: GraduationCap,
    color: '#06b6d4',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
  },
  compras: {
    id: 'compras',
    label: 'Compras',
    icon: ShoppingBag,
    color: '#5b6ff5',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  otros: {
    id: 'otros',
    label: 'Otros',
    icon: CircleEllipsis,
    color: '#64748b',
    bg: 'bg-slate-100',
    text: 'text-slate-600',
  },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)
