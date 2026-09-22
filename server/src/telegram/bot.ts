import { Telegraf } from 'telegraf'
import { randomUUID } from 'node:crypto'
import { add } from '../store.js'
import { parseGastoCommand } from './parser.js'
import { CATEGORY_LABELS } from '../categories.js'
import { getMonthlyTotal, getTodayTotal } from '../summary.js'
import type { Expense } from '../types.js'

const formatMoney = (value: number) => `$${value.toLocaleString('es-AR')}`

export function startBot(): void {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const allowedChatId = process.env.TELEGRAM_ALLOWED_CHAT_ID

  if (!token) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN no configurado: el bot no se inició.')
    return
  }

  const bot = new Telegraf(token)
  const isAllowed = (chatId: number): boolean => !allowedChatId || String(chatId) === allowedChatId

  bot.start((ctx) => {
    const lockWarning = allowedChatId
      ? ''
      : `⚠️ Todavía no restringiste el bot a tu chat. Copiá este id en TELEGRAM_ALLOWED_CHAT_ID (archivo .env del servidor) y reiniciá el bot, así nadie más puede cargarte gastos.\n\n`

    ctx.reply(
      `¡Hola! Tu chat id es ${ctx.chat.id}.\n\n${lockWarning}` +
        `Cargá un gasto así:\n/gasto <monto> <categoría> <descripción>\n\n` +
        `Ejemplo:\n/gasto 3500 comida Supermercado Coto\n\n` +
        `Usá /ayuda para ver todos los comandos y categorías.`,
    )
  })

  const sendHelp = (ctx: { chat: { id: number }; reply: (text: string) => Promise<unknown> }) => {
    if (!isAllowed(ctx.chat.id)) return
    const categorias = Object.values(CATEGORY_LABELS).join(', ')
    ctx.reply(
      `Comandos disponibles:\n\n` +
        `/gasto <monto> <categoría> <descripción> — registra un gasto\n` +
        `/hoy — total gastado hoy\n` +
        `/mes — total y detalle del mes actual\n\n` +
        `Categorías: ${categorias}\n\n` +
        `Si no reconozco la categoría, el gasto queda en "Otros" y esa palabra pasa a formar parte de la descripción.`,
    )
  }
  bot.help(sendHelp)
  bot.command('ayuda', sendHelp)

  bot.command('gasto', async (ctx) => {
    if (!isAllowed(ctx.chat.id)) {
      await ctx.reply('No estás autorizado para usar este bot.')
      return
    }

    const argsText = ctx.message.text.replace(/^\/gasto(@\w+)?\s*/, '')
    const parsed = parseGastoCommand(argsText)

    if (parsed === 'empty' || parsed === 'no-amount') {
      await ctx.reply(
        'No pude leer el monto. Formato:\n/gasto <monto> <categoría> <descripción>\n\nEjemplo:\n/gasto 3500 comida Supermercado Coto',
      )
      return
    }

    const expense: Expense = {
      id: randomUUID(),
      description: parsed.description,
      amount: parsed.amount,
      category: parsed.category,
      date: new Date().toISOString().slice(0, 10),
      createdAt: Date.now(),
      source: 'telegram',
    }

    await add(expense)

    await ctx.reply(
      `✅ ${CATEGORY_LABELS[parsed.category]} — ${formatMoney(parsed.amount)} (${parsed.description})`,
    )
  })

  bot.command('hoy', async (ctx) => {
    if (!isAllowed(ctx.chat.id)) return
    const total = await getTodayTotal()
    await ctx.reply(`Gastado hoy: ${formatMoney(total)}`)
  })

  bot.command('mes', async (ctx) => {
    if (!isAllowed(ctx.chat.id)) return
    const { total, byCategory } = await getMonthlyTotal()
    const lines = Object.entries(byCategory)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .map(([cat, amount]) => `• ${CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}: ${formatMoney(amount as number)}`)

    await ctx.reply(`Total del mes: ${formatMoney(total)}\n\n${lines.join('\n') || 'Sin gastos todavía.'}`)
  })

  bot.catch((err) => console.error('[telegram] error:', err))

  bot.launch()
  console.log('[telegram] Bot iniciado (long polling)')

  process.once('SIGINT', () => bot.stop('SIGINT'))
  process.once('SIGTERM', () => bot.stop('SIGTERM'))
}
