import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { expensesRouter } from './routes/expenses.js'
import { startBot } from './telegram/bot.js'

const app = express()
const port = Number(process.env.PORT) || 3001

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/expenses', expensesRouter)

app.listen(port, () => {
  console.log(`[server] Escuchando en http://localhost:${port}`)
})

startBot()
