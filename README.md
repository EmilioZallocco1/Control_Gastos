# Mis Gastos

Sistema simple para gestionar tus gastos mensuales: cargá movimientos (a mano o por Telegram), categorizalos y mirá cómo se distribuye tu plata mes a mes.

## Stack

**Frontend** (`/`)
- **React 18 + TypeScript + Vite** — SPA rápida.
- **Tailwind CSS** — estilos, con una paleta e identidad visual propia (`brand`, tarjetas con sombra suave, animaciones sutiles).
- **Recharts** — gráfico de torta por categoría y gráfico de barras de tendencia (últimos 6 meses).
- **lucide-react** — íconos.

**Backend** (`/server`)
- **Express + TypeScript** — API REST de gastos.
- **Telegraf** — bot de Telegram para cargar gastos por mensaje.
- Persistencia en un archivo JSON (`server/data/expenses.json`) — sin base de datos externa.

El frontend ya no usa `localStorage`: consulta al backend y se actualiza solo (cada 8s) para reflejar lo que cargues desde Telegram. Ver el detalle completo de esta integración en [docs/telegram-integration.md](docs/telegram-integration.md).

## Cómo correrlo

```bash
npm install
cd server && npm install && cd ..
```

Levantar frontend y backend juntos:

```bash
npm run dev:all
```

O por separado, en dos terminales:

```bash
npm run dev       # frontend, http://localhost:5173
npm run server    # backend,  http://localhost:3001
```

Para configurar el bot de Telegram (token, restringir tu chat, comandos disponibles), seguí [docs/telegram-integration.md](docs/telegram-integration.md). Sin token configurado, el backend arranca igual y la web funciona normalmente — solo no vas a poder cargar gastos por Telegram.

Para generar el build de producción del frontend:

```bash
npm run build
npm run preview
```

## Funcionalidades

- Alta, edición y borrado de gastos (descripción, monto, categoría, fecha) desde la web.
- Alta de gastos por Telegram (`/gasto <monto> <categoría> <descripción>`), con `/hoy` y `/mes` para consultar totales sin abrir la web.
- Selector de mes para navegar el historial.
- Tarjetas de resumen: total del mes, promedio diario, categoría principal y cantidad de gastos.
- Gráfico de torta con la distribución por categoría del mes seleccionado.
- Gráfico de barras con la tendencia de los últimos 6 meses.
- Listado de movimientos del mes, ordenado por fecha, con indicador de si el gasto vino de Telegram.

## Estructura del proyecto

```
src/                       # Frontend
├── api/                  # Cliente HTTP hacia el backend
├── components/
│   ├── layout/           # Header y elementos de layout general
│   ├── dashboard/        # Selector de mes, tarjetas de resumen, gráficos
│   ├── expenses/         # Formulario, lista e ítem de gasto
│   └── ui/               # Componentes base reutilizables (Button, Card, Modal, Input, Select)
├── context/              # Estado global de gastos (ExpensesContext), habla con la API
├── pages/                # Dashboard (página principal)
├── types/                # Tipos TypeScript (Expense, categorías)
├── utils/                # Formateo de moneda/fechas y metadata de categorías
├── App.tsx
├── main.tsx
└── index.css

server/                    # Backend
├── src/
│   ├── index.ts          # arranca Express + el bot de Telegram
│   ├── store.ts          # persistencia en server/data/expenses.json
│   ├── summary.ts        # totales de hoy / del mes
│   ├── categories.ts     # labels + alias de categorías
│   ├── routes/           # endpoints REST (/api/expenses)
│   └── telegram/         # comandos del bot y parser de mensajes
└── .env.example

docs/
└── telegram-integration.md   # cómo configurar y usar el bot
```

## Categorías incluidas

Comida, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Educación, Compras y Otros — cada una con su ícono y color distintivo.
