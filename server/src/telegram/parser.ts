import { resolveCategory, CATEGORY_LABELS } from '../categories.js'
import type { CategoryId } from '../types.js'

export interface ParsedExpense {
  amount: number
  category: CategoryId
  description: string
}

export type ParseError = 'empty' | 'no-amount'

/**
 * Formato esperado: "<monto> [categoría] [descripción...]"
 * La categoría es opcional: si la primera palabra después del monto no matchea
 * ninguna categoría conocida, se toma todo como descripción y la categoría
 * queda en "otros".
 */
export function parseGastoCommand(text: string): ParsedExpense | ParseError {
  const trimmed = text.trim()
  if (!trimmed) return 'empty'

  const parts = trimmed.split(/\s+/)
  const amount = Number(parts[0].replace(',', '.'))
  if (!Number.isFinite(amount) || amount <= 0) return 'no-amount'

  const rest = parts.slice(1)
  const maybeCategory = rest.length > 0 ? resolveCategory(rest[0]) : null

  const category: CategoryId = maybeCategory ?? 'otros'
  const descriptionParts = maybeCategory ? rest.slice(1) : rest
  const description = descriptionParts.join(' ').trim() || CATEGORY_LABELS[category]

  return { amount, category, description }
}
