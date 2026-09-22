# Integración con Telegram

Permite cargar gastos escribiéndole a un bot de Telegram: el mensaje se guarda en el servidor y aparece en la web automáticamente (la página consulta el servidor cada 8 segundos).

## Por qué hizo falta un backend

La app original guardaba todo en `localStorage`, que vive únicamente en el navegador donde la abriste. Un mensaje de Telegram llega del lado del servidor, así que no hay forma de que "aparezca solo" en `localStorage`. Por eso se agregó `server/`: un backend que:

1. Recibe los mensajes del bot de Telegram.
2. Los interpreta y guarda los gastos en un archivo (`server/data/expenses.json`).
3. Expone una API REST que la web usa para leer y modificar gastos (reemplaza a `localStorage`).

```
Telegram (tu chat) ──▶ Bot (telegraf, long polling) ──▶ server/data/expenses.json
                                                                  ▲
                                                                  │ REST API
                                                                  │
                                              Frontend (React) ───┘ (fetch + polling cada 8s)
```

No se usó una base de datos "de verdad" (Postgres, SQLite, etc.) a propósito: para un solo usuario, un archivo JSON es más simple, no requiere instalar nada adicional y no tiene problemas de compilación nativa en Windows.

## Estructura agregada

```
server/
├── src/
│   ├── app.ts               # arma la app de Express (sin levantar el puerto ni el bot)
│   ├── index.ts             # arranca Express (app.ts) + el bot
│   ├── store.ts             # lectura/escritura de server/data/expenses.json
│   ├── summary.ts           # totales de hoy / del mes (para /hoy y /mes)
│   ├── categories.ts        # labels + alias de categorías ("uber" → transporte, etc.)
│   ├── categories.test.ts   # tests de resolveCategory
│   ├── types.ts             # tipos compartidos (duplican los del frontend)
│   ├── routes/
│   │   ├── expenses.ts      # GET/POST/PUT/DELETE /api/expenses
│   │   └── expenses.test.ts # tests de la API con Supertest
│   └── telegram/
│       ├── bot.ts           # comandos del bot (/start, /ayuda, /gasto, /hoy, /mes)
│       ├── parser.ts        # interpreta el texto de "/gasto ..."
│       └── parser.test.ts   # tests del parser
├── data/expenses.json       # "base de datos" (no se sube a git)
└── .env.example
```

`app.ts` está separado de `index.ts` para poder testear la API sin levantar el bot ni un puerto real — ver [docs/testing.md](testing.md) para el detalle de cómo correr los tests.

En el frontend:
- `src/api/expenses.ts`: cliente HTTP hacia el backend.
- `src/context/ExpensesContext.tsx`: ya no usa `localStorage`; hace `fetch` al backend y refresca cada 8 segundos (así detecta gastos cargados por Telegram mientras tenés la web abierta).
- `src/components/expenses/ExpenseItem.tsx`: muestra un ícono ✈️ (Telegram) junto a los gastos que llegaron por el bot.

## Configuración paso a paso

### 1. Crear el bot

1. Hablale a [@BotFather](https://t.me/BotFather) en Telegram.
2. Enviale `/newbot` y seguí las instrucciones (nombre + username terminado en `bot`).
3. Te va a dar un **token** (algo como `123456789:AAExxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`). Guardalo.

### 2. Configurar el servidor

```bash
cd server
cp .env.example .env
```

Editá `server/.env` y pegá el token:

```
PORT=3001
TELEGRAM_BOT_TOKEN=el_token_que_te_dio_botfather
TELEGRAM_ALLOWED_CHAT_ID=
```

### 3. Instalar dependencias y levantar todo

Desde la raíz del proyecto:

```bash
npm install
npm run server        # instala e inicia el backend, en otra terminal
```

O instalar el backend por separado la primera vez:

```bash
cd server
npm install
npm run dev
```

Vas a ver en la consola:

```
[telegram] Bot iniciado (long polling)
[server] Escuchando en http://localhost:3001
```

Levantá también el frontend (en otra terminal, desde la raíz):

```bash
npm run dev
```

O, si instalaste `concurrently` (ya viene en el `package.json` raíz), podés levantar los dos juntos con:

```bash
npm run dev:all
```

### 4. Restringir el bot a tu chat (importante)

Sin esto, **cualquiera que encuentre tu bot podría cargarte gastos falsos**. Para evitarlo:

1. Escribile `/start` a tu bot desde Telegram.
2. Te va a responder con tu **chat id** (un número).
3. Pegalo en `server/.env`:
   ```
   TELEGRAM_ALLOWED_CHAT_ID=123456789
   ```
4. Reiniciá el servidor (`Ctrl+C` y `npm run dev` de nuevo).

A partir de ahí, el bot ignora mensajes de cualquier otro chat.

## Comandos del bot

| Comando | Qué hace |
|---|---|
| `/start` | Saludo inicial + te muestra tu chat id |
| `/ayuda` | Lista de comandos y categorías válidas |
| `/gasto <monto> <categoría> <descripción>` | Carga un gasto |
| `/hoy` | Total gastado en el día |
| `/mes` | Total del mes + detalle por categoría |

### Ejemplos de `/gasto`

```
/gasto 3500 comida Supermercado Coto
/gasto 1200 uber Vuelta a casa
/gasto 850 nafta
/gasto 500 Regalo cumpleaños
```

- El **monto** es siempre lo primero (acepta coma o punto decimal).
- La **categoría** es la segunda palabra, si la reconoce. Si no matchea ninguna categoría conocida (ej. "Regalo" en el último ejemplo no es una categoría, es parte de la descripción), el gasto queda en **Otros** y esa palabra pasa a formar parte de la descripción.
- Categorías reconocidas (y algunos alias): `comida` (super, supermercado, almuerzo, cena), `transporte` (auto, nafta, colectivo, uber), `vivienda` (alquiler, expensas), `servicios` (luz, gas, agua, internet, telefono), `entretenimiento` (ocio, salidas), `salud` (farmacia, medico), `educacion` (curso, facultad), `compras` (ropa), `otros`.
- La fecha siempre es la del día en que mandás el mensaje (el bot no interpreta fechas del texto).

## Cómo se refleja en la web

La web (`ExpensesContext`) consulta `GET /api/expenses` al cargar y despues cada 8 segundos. Si tenés la página abierta y cargás un gasto por Telegram, va a aparecer solo, sin recargar, en un máximo de 8 segundos. Los gastos cargados por el bot muestran un ícono de avioncito (✈️) al lado de la descripción para diferenciarlos de los cargados manualmente en la web.

## Limitaciones conocidas

- **Sin autenticación en la API REST**: `server/` está pensado para correr en tu máquina (`localhost`). Si lo desplegás en algún hosting público sin agregar autenticación, cualquiera podría leer o modificar tus gastos vía la API. No lo expongas a internet tal cual está.
- **El servidor tiene que estar corriendo** para que la web funcione (ya no hay `localStorage` de respaldo). Si lo cerrás, la web va a mostrar un aviso de "no se pudo conectar con el servidor".
- **Persistencia simple**: `server/data/expenses.json` es un archivo, no una base de datos transaccional. Para uso personal (una persona, pocos gastos por día) es más que suficiente.
- **El bot depende de que tu compu esté prendida** y el proceso corriendo (usa *long polling*, no un webhook público). Si querés poder cargar gastos desde el celular en cualquier momento aunque tu PC esté apagada, el siguiente paso sería desplegar `server/` en un hosting (Railway, Render, etc.).
