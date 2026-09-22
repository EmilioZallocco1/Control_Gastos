import 'dotenv/config'
import { createApp } from './app.js'
import { startBot } from './telegram/bot.js'

const port = Number(process.env.PORT) || 3001

createApp().listen(port, () => {
  console.log(`[server] Escuchando en http://localhost:${port}`)
})

startBot()
