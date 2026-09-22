# Mis Gastos

Sistema simple para gestionar tus gastos mensuales: cargá movimientos, categorizalos y mirá cómo se distribuye tu plata mes a mes.

## Stack

- **React 18 + TypeScript + Vite** — SPA rápida, sin backend.
- **Tailwind CSS** — estilos, con una paleta e identidad visual propia (`brand`, tarjetas con sombra suave, animaciones sutiles).
- **Recharts** — gráfico de torta por categoría y gráfico de barras de tendencia (últimos 6 meses).
- **lucide-react** — íconos.
- **localStorage** — persistencia local, no requiere servidor ni base de datos. Todo tu historial queda guardado en el navegador.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrí la URL que te muestra la terminal (por defecto `http://localhost:5173`).

Para generar el build de producción:

```bash
npm run build
npm run preview
```

## Funcionalidades

- Alta, edición y borrado de gastos (descripción, monto, categoría, fecha).
- Selector de mes para navegar el historial.
- Tarjetas de resumen: total del mes, promedio diario, categoría principal y cantidad de gastos.
- Gráfico de torta con la distribución por categoría del mes seleccionado.
- Gráfico de barras con la tendencia de los últimos 6 meses.
- Listado de movimientos del mes, ordenado por fecha.

## Estructura del proyecto

```
src/
├── components/
│   ├── layout/        # Header y elementos de layout general
│   ├── dashboard/      # Selector de mes, tarjetas de resumen, gráficos
│   ├── expenses/        # Formulario, lista e ítem de gasto
│   └── ui/              # Componentes base reutilizables (Button, Card, Modal, Input, Select)
├── context/            # Estado global de gastos (ExpensesContext) + persistencia
├── hooks/              # Hooks reutilizables (useLocalStorage)
├── pages/              # Dashboard (página principal)
├── types/              # Tipos TypeScript (Expense, categorías)
├── utils/              # Formateo de moneda/fechas y metadata de categorías
├── App.tsx
├── main.tsx
└── index.css
```

## Categorías incluidas

Comida, Transporte, Vivienda, Servicios, Entretenimiento, Salud, Educación, Compras y Otros — cada una con su ícono y color distintivo.
