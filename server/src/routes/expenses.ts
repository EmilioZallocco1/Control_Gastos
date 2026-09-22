import { Router } from 'express'
import { randomUUID } from 'node:crypto'
import { add, getAll, remove, update } from '../store.js'
import type { Expense, ExpenseInput } from '../types.js'

export const expensesRouter = Router()

expensesRouter.get('/', async (_req, res) => {
  res.json(await getAll())
})

expensesRouter.post('/', async (req, res) => {
  const body = req.body as Partial<ExpenseInput>
  if (!body.description || !body.amount || !body.category || !body.date) {
    res.status(400).json({ error: 'Faltan campos requeridos (description, amount, category, date)' })
    return
  }

  const expense: Expense = {
    id: randomUUID(),
    description: body.description,
    amount: Number(body.amount),
    category: body.category,
    date: body.date,
    createdAt: Date.now(),
    source: 'web',
  }

  res.status(201).json(await add(expense))
})

expensesRouter.put('/:id', async (req, res) => {
  const updated = await update(req.params.id, req.body as Partial<Expense>)
  if (!updated) {
    res.status(404).json({ error: 'Gasto no encontrado' })
    return
  }
  res.json(updated)
})

expensesRouter.delete('/:id', async (req, res) => {
  const ok = await remove(req.params.id)
  if (!ok) {
    res.status(404).json({ error: 'Gasto no encontrado' })
    return
  }
  res.status(204).send()
})
