import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Expense } from './types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configurable para que los tests puedan apuntar a un archivo temporal
// en vez de pisar los gastos reales del usuario.
const DATA_FILE = process.env.EXPENSES_DATA_FILE
  ? path.resolve(process.env.EXPENSES_DATA_FILE)
  : path.join(__dirname, '..', 'data', 'expenses.json')

let expenses: Expense[] = []
let loaded = false
let writeQueue: Promise<void> = Promise.resolve()

async function ensureLoaded(): Promise<void> {
  if (loaded) return
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    expenses = JSON.parse(raw) as Expense[]
  } catch {
    expenses = []
  }
  loaded = true
}

function persist(): Promise<void> {
  // Encadenamos las escrituras para no pisarnos si llegan varias casi juntas
  // (ej. el bot de Telegram y la web guardando al mismo tiempo).
  writeQueue = writeQueue.then(() =>
    fs.writeFile(DATA_FILE, JSON.stringify(expenses, null, 2), 'utf-8'),
  )
  return writeQueue
}

export async function getAll(): Promise<Expense[]> {
  await ensureLoaded()
  return expenses
}

export async function add(expense: Expense): Promise<Expense> {
  await ensureLoaded()
  expenses.unshift(expense)
  await persist()
  return expense
}

export async function update(id: string, patch: Partial<Expense>): Promise<Expense | null> {
  await ensureLoaded()
  const idx = expenses.findIndex((e) => e.id === id)
  if (idx === -1) return null
  expenses[idx] = { ...expenses[idx], ...patch, id: expenses[idx].id }
  await persist()
  return expenses[idx]
}

export async function remove(id: string): Promise<boolean> {
  await ensureLoaded()
  const before = expenses.length
  expenses = expenses.filter((e) => e.id !== id)
  if (expenses.length === before) return false
  await persist()
  return true
}
