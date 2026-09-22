import type { CategoryId } from './types.js'

export const CATEGORY_LABELS: Record<CategoryId, string> = {
  comida: 'Comida',
  transporte: 'Transporte',
  vivienda: 'Vivienda',
  servicios: 'Servicios',
  entretenimiento: 'Entretenimiento',
  salud: 'Salud',
  educacion: 'Educación',
  compras: 'Compras',
  otros: 'Otros',
}

export const CATEGORY_LIST = Object.keys(CATEGORY_LABELS) as CategoryId[]

/** Alias en minúsculas y sin acentos -> categoría. Debe mantenerse en sync con src/utils/categories.ts del frontend. */
const ALIASES: Record<string, CategoryId> = {
  comida: 'comida',
  super: 'comida',
  supermercado: 'comida',
  almuerzo: 'comida',
  cena: 'comida',
  transporte: 'transporte',
  auto: 'transporte',
  nafta: 'transporte',
  colectivo: 'transporte',
  uber: 'transporte',
  vivienda: 'vivienda',
  alquiler: 'vivienda',
  expensas: 'vivienda',
  servicios: 'servicios',
  luz: 'servicios',
  gas: 'servicios',
  agua: 'servicios',
  internet: 'servicios',
  telefono: 'servicios',
  entretenimiento: 'entretenimiento',
  ocio: 'entretenimiento',
  salidas: 'entretenimiento',
  salud: 'salud',
  farmacia: 'salud',
  medico: 'salud',
  educacion: 'educacion',
  curso: 'educacion',
  facultad: 'educacion',
  compras: 'compras',
  ropa: 'compras',
  otros: 'otros',
  otro: 'otros',
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function resolveCategory(token: string): CategoryId | null {
  return ALIASES[normalize(token)] ?? null
}
