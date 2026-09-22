# Testing

Estrategia de pruebas del proyecto: qué está automatizado, qué se prueba a mano y por qué.

## Resumen

| Área | Tipo de prueba | Dónde |
|---|---|---|
| Parser de mensajes de Telegram (`parseGastoCommand`) | Automatizada (unit) | `server/src/telegram/parser.test.ts` |
| Resolución de alias de categorías (`resolveCategory`) | Automatizada (unit) | `server/src/categories.test.ts` |
| API REST (`/api/expenses`, `/api/health`) | Automatizada (integración) | `server/src/routes/expenses.test.ts` |
| Interfaz web (formulario, gráficos, cálculos) | Manual | `docs/casos-de-prueba-manuales.xlsx` |
| Bot de Telegram (comandos, autorización) | Manual | `docs/casos-de-prueba-manuales.xlsx` |
| Integración web ↔ Telegram (sincronización, persistencia) | Manual | `docs/casos-de-prueba-manuales.xlsx` |

## Por qué esta división

- El **parser** y la **resolución de categorías** son funciones puras (sin red, sin archivos, sin estado): el candidato ideal para tests unitarios rápidos y confiables. Es también la lógica con más "casos raros" (montos con coma, categorías no reconocidas, texto vacío), donde un test automatizado detecta regresiones que a simple vista pasan desapercibidas.
- La **API REST** se presta bien a tests de integración con Supertest: no depende de un navegador, y cubre los casos de error (400, 404) que en pruebas manuales se suelen saltear.
- La **web** (React) y el **bot real de Telegram** requieren o un navegador o una cuenta de Telegram interactuando de verdad — automatizarlos (Playwright para la web, un mock de la API de Telegram para el bot) es válido pero es una inversión mayor que no se justifica todavía para un proyecto personal. Se probaron manualmente con la planilla de casos de prueba.

## Tests automatizados

### Cómo correrlos

```bash
cd server
npm install   # si no lo hiciste antes
npm test
```

Para dejarlos corriendo en modo watch mientras programás:

```bash
npm run test:watch
```

Están escritos con **Vitest** (rápido, sin configuración extra) y **Supertest** (para pegarle a la app de Express sin necesidad de levantar el puerto real).

### Qué cubre cada archivo

**`server/src/telegram/parser.test.ts`** (12 casos) — `parseGastoCommand`:
- Monto + categoría reconocida + descripción.
- Alias de categoría (`uber` → transporte, etc.).
- Categoría insensible a mayúsculas/acentos.
- Palabra no reconocida como categoría → cae en "Otros" y se conserva en la descripción.
- Sin descripción → usa el nombre de la categoría como descripción por defecto.
- Monto con coma y con punto decimal.
- Monto no numérico, cero o negativo → error `no-amount`.
- Texto vacío → error `empty`.
- Espacios extra entre palabras.

**`server/src/categories.test.ts`** (4 casos) — `resolveCategory`:
- Nombre exacto de categoría.
- Alias conocidos (`super`, `nafta`, `alquiler`, `farmacia`).
- Insensibilidad a mayúsculas y acentos.
- Palabra desconocida → `null`.

**`server/src/routes/expenses.test.ts`** (9 casos) — endpoints REST:
- `GET /api/health` responde `{ ok: true }`.
- `GET /api/expenses` vacío al empezar.
- `POST /api/expenses` crea un gasto válido (201, con `id`/`createdAt`/`source: "web"`).
- `POST /api/expenses` con campos faltantes responde 400.
- El gasto creado aparece luego en `GET /api/expenses`.
- `PUT /api/expenses/:id` actualiza un gasto existente.
- `PUT /api/expenses/:id` con id inexistente responde 404.
- `DELETE /api/expenses/:id` elimina un gasto (204).
- `DELETE /api/expenses/:id` con id inexistente responde 404.

### Aislamiento: no tocan tus datos reales

`server/src/store.ts` lee la ruta del archivo de datos de la variable de entorno `EXPENSES_DATA_FILE` (si está definida) en vez de usar siempre `server/data/expenses.json`. Los tests de la API generan un archivo temporal distinto en cada corrida (`beforeEach`) y lo borran al terminar (`afterEach`), así nunca pisan ni leen tus gastos reales.

### Cómo se separó `app.ts` de `index.ts`

Antes, `server/src/index.ts` armaba la app de Express, la ponía a escuchar (`listen`) y arrancaba el bot, todo junto. Para poder testear la API con Supertest sin levantar un puerto real ni conectar el bot de Telegram, se separó en:

- **`server/src/app.ts`** — arma y devuelve la app de Express configurada (`createApp()`), sin `listen` ni bot. Es lo que importan los tests.
- **`server/src/index.ts`** — importa `createApp()`, la pone a escuchar en el puerto configurado, y arranca el bot (`startBot()`). Es lo que se ejecuta con `npm run dev` / `npm start`.

### Nota de seguridad de las dependencias de testing

Al instalar Vitest apareció una vulnerabilidad moderada conocida en `@vitest/mocker` ([GHSA-82fw-gwwq-j7x9](https://github.com/advisories/GHSA-82fw-gwwq-j7x9), path traversal en el mecanismo de mocking). La corrección definitiva está en Vitest 5, pero esa versión requiere Node ≥22.12 y esta máquina tiene Node 20.11. Se usó Vitest 3.2 (última versión compatible) a propósito:
- Es una dependencia de **desarrollo**, no viaja a producción ni corre en el servidor real.
- La explotación requeriría que un archivo de test propio (no de terceros) configure un redirect de mock malicioso — no aplica al uso normal de este proyecto.
- Si en algún momento actualizás Node a 22+, conviene subir a `vitest@^5` para cerrar esto del todo (`cd server && npm install -D vitest@^5`).

## Pruebas manuales

Archivo: **[casos-de-prueba-manuales.xlsx](casos-de-prueba-manuales.xlsx)** — 27 casos de prueba divididos en tres módulos:

- **Web (W-01 a W-16):** alta/edición/borrado de gastos, validaciones del formulario, navegación de mes, cálculos de las tarjetas de resumen, gráficos, indicador de gastos por Telegram, aviso de backend caído.
- **Bot Telegram (B-01 a B-09):** `/start`, `/ayuda`, `/gasto` (con categoría reconocida, no reconocida, monto inválido, coma decimal), `/hoy`, `/mes`, y el rechazo de chats no autorizados.
- **Integración (I-01, I-02):** que un gasto cargado por Telegram aparezca en la web sin recargar, y que los datos persistan al reiniciar el backend.

### Cómo usarla

1. Abrí el archivo y leé la hoja **"Instrucciones"** primero.
2. Levantá el proyecto completo (`npm run dev:all` desde la raíz, o frontend y backend por separado).
3. Para cada fila de la hoja **"Casos de Prueba"**, seguí los **Pasos** con los **Datos de Entrada** indicados y compará contra el **Resultado Esperado**.
4. Completá las tres columnas resaltadas en amarillo: **Resultado Obtenido**, **Estado** (elegí de la lista desplegable: Pasa / Falla / Bloqueado / Pendiente) y **Observaciones**.

## Si querés ampliar la automatización más adelante

- **Playwright** para un puñado de flujos E2E de la web (alta de gasto, edición, borrado) — cubriría los casos W-01 a W-06 de la planilla.
- **Mock de la API de Telegram** (por ejemplo interceptando `fetch` hacia `api.telegram.org`) para probar `bot.ts` sin depender de una cuenta real — cubriría B-01 a B-09.
- Ninguna de las dos es necesaria hoy: el volumen de cambios del proyecto no justifica el mantenimiento extra todavía.
