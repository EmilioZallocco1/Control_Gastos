import express from 'express'
import cors from 'cors'
import { expensesRouter } from './routes/expenses.js'

export function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.get('/api/health', (_req, res) => res.json({ ok: true }))
  app.use('/api/expenses', expensesRouter)

  return app
}
