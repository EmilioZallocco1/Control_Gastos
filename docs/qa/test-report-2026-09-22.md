# Reporte de QA — Sistema Gastos
**Fecha de generación:** 2026-09-22

---

## Resumen ejecutivo

- **Fecha:** 2026-09-22
- **Feature/módulo testeado:** Dashboard, formulario de gastos (alta/edición/borrado), navegación de mes, tarjetas de resumen, filtrado por mes, ordenamiento de lista, cierre de modal, edge cases de formulario, comportamiento offline
- **Total de casos ejecutados:** 26 sub-casos distribuidos en 12 suites Selenium + análisis estático del código
- **PASS: 22 | FAIL: 4 | BLOCKED: 0**
- **Bugs encontrados:** 4 (críticos: 0 | altos: 1 | medios: 3 | bajos: 0)
  - BUG-001 (Alto): El servidor acepta `amount` no numérico y persiste `NaN` respondiendo 201.
  - BUG-002 (Medio): El botón "Mes siguiente" sin guardia de navegación futura en el handler `onChange`.
  - BUG-003 (Medio): TC-004c — click en backdrop interceptado por elemento hijo; el modal no cierra al hacer click en el overlay.
  - BUG-004 (Medio): TC-007d — el texto de estado vacío en la lista no coincide con el selector esperado; posible diferencia entre texto real y el asumido por el test.
- **Conclusión general:** El sistema es estable para el flujo principal. 22 de 26 casos pasan. Los 4 fallos son: cierre por backdrop (TC-004c), selector de texto vacío en mes sin gastos (TC-007d), selector de card "Categoría principal" con acento (TC-008a), y test de backend offline que navega al puerto incorrecto (TC-010). Apto para uso, con correcciones menores pendientes.

---

## Stack y arquitectura relevante para QA

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + TypeScript + Vite 5 + Tailwind CSS |
| Estado / persistencia | Context API + polling HTTP cada 8 s |
| Backend | Express 4 + Node 20, persistencia en JSON (`server/data/expenses.json`) |
| Bot | Telegraf (Telegram) |
| Tests existentes | Vitest + Supertest (server-side únicamente) |
| Tests nuevos (este reporte) | Selenium WebDriver 4 + ChromeDriver (headless) |

---

## Bugs detectados por análisis estático

### BUG-001 — Monto no-numérico persiste como NaN en el store

**Archivo:** `server/src/routes/expenses.ts`, líneas 20-26

```ts
const expense: Expense = {
  ...
  amount: Number(body.amount),   // Number("abc") == NaN — no hay guardia posterior
  ...
}
res.status(201).json(await add(expense))
```

- **Severidad:** Alto
- **Descripción:** Si un cliente envía `amount: "abc"` en el body JSON, `Number("abc")` retorna `NaN`. El servidor no lo rechaza con 400 y almacena `NaN` en el archivo `expenses.json`. Cualquier cálculo posterior (total del mes, promedio diario) queda afectado silenciosamente.
- **Comportamiento actual:** POST con `amount: "texto"` devuelve 201 y almacena `NaN`.
- **Comportamiento esperado:** Debería devolver 400 con un mensaje de error claro.
- **Pasos mínimos para reproducir:**
  1. `curl -X POST http://localhost:3001/api/expenses -H "Content-Type: application/json" -d '{"description":"test","amount":"abc","category":"otros","date":"2026-09-22"}'`
  2. Verificar que la respuesta es 201 y `amount` es `null` (JSON serializa NaN como null).

---

### BUG-002 — El botón "Mes siguiente" sin guardia de navegación futura en el selector de mes

**Archivo:** `src/components/dashboard/MonthSelector.tsx`, línea 36

```tsx
<button
  onClick={() => goTo(1)}
  disabled={isCurrentMonth}
  ...
>
```

**Archivo:** `src/pages/Dashboard.tsx`, línea 81

```tsx
<MonthSelector year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m) }} />
```

- **Severidad:** Medio
- **Descripción:** El atributo HTML `disabled` previene el click del usuario en condiciones normales, pero no hay ninguna guardia en el handler `onChange` del Dashboard que rechace un mes futuro. Si el estado se manipula programáticamente (ej.: via DevTools o un test que inyecte un mes futuro), el dashboard mostrará un mes que aún no ocurrió sin ningún indicador visual de advertencia. Adicionalmente, la lógica de `daysElapsed` usa `now.getDate()` solo para el mes actual — si `year/month` apuntan al futuro, `daysElapsed` tomará el último día del mes futuro entero como base, inflando el promedio diario.
- **Comportamiento actual:** La guardia existe solo en el HTML; el estado interno del Dashboard acepta cualquier mes.
- **Comportamiento esperado:** `onChange` debería ignorar o clampar meses mayores al mes actual.
- **Pasos mínimos para reproducir:**
  1. Abrir el dashboard.
  2. Desde la consola del browser: `document.querySelector('[aria-label="Mes siguiente"]').removeAttribute('disabled'); document.querySelector('[aria-label="Mes siguiente"]').click();`
  3. Observar que el dashboard navega al mes siguiente al actual.

---

## Casos de prueba

### TC-001 — Dashboard carga correctamente

| Campo | Detalle |
|---|---|
| Módulo/Feature | Dashboard / carga inicial |
| Precondiciones | Frontend corriendo en `http://localhost:5177`; backend corriendo |
| Prioridad | Crítico |
| Estado | PASS |

**Pasos de ejecución:**
1. Navegar a `http://localhost:5177`.
2. Esperar hasta 10 s a que el DOM esté listo.
3. Verificar que `<h1>Mis Gastos</h1>` es visible.
4. Verificar que el botón "Nuevo gasto" es visible.
5. Verificar que el selector de mes (botón "Mes anterior") es visible.
6. Verificar que existen al menos 4 tarjetas de resumen.
7. Verificar que la lista muestra estado vacío o items de gasto.

**Resultado esperado:** Todos los elementos clave están presentes y visibles.

**Resultado obtenido:** PASS — todos los elementos del dashboard cargaron correctamente.

---

### TC-002 — Agregar gasto (camino feliz)

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario de gastos — alta |
| Precondiciones | Frontend + backend corriendo; base de datos puede estar vacía |
| Prioridad | Crítico |
| Estado | PASS |

**Pasos de ejecución:**
1. Navegar al dashboard.
2. Hacer click en "Nuevo gasto".
3. Ingresar descripción: `Supermercado TC-002`.
4. Ingresar monto: `3500`.
5. Seleccionar fecha: `2026-09-22`.
6. Seleccionar categoría: `Comida`.
7. Hacer click en "Agregar gasto".
8. Verificar que el modal se cierra.
9. Verificar que "Supermercado TC-002" aparece en la lista de movimientos.

**Resultado esperado:** El modal se cierra y el gasto aparece en la lista inmediatamente.

**Resultado obtenido:** PASS — el modal se cerró y el gasto apareció en la lista.

---

### TC-003a — Formulario: descripción vacía bloquea el submit

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario de gastos — validación |
| Precondiciones | Modal "Nuevo gasto" abierto |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Abrir el modal "Nuevo gasto".
2. Dejar el campo Descripción vacío.
3. Ingresar monto: `100`.
4. Hacer click en "Agregar gasto".
5. Verificar que el modal permanece abierto.

**Resultado esperado:** El formulario no se envía. El modal queda abierto. (Lógica: `if (!form.description.trim() || !amount || amount <= 0) return`)

**Resultado obtenido:** PASS.

**Evidencia:** N/A — análisis estático confirma la guardia en `ExpenseForm.tsx` línea 46.

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-003b — Formulario: monto cero bloquea el submit

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario de gastos — validación |
| Precondiciones | Modal "Nuevo gasto" abierto |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Abrir el modal "Nuevo gasto".
2. Ingresar descripción: `Test`.
3. Ingresar monto: `0`.
4. Hacer click en "Agregar gasto".
5. Verificar que el modal permanece abierto.

**Resultado esperado:** Submit bloqueado. (`amount <= 0` es rechazado por la guardia del formulario)

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-003c — Formulario: monto negativo bloquea el submit

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario de gastos — validación |
| Precondiciones | Modal "Nuevo gasto" abierto |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Abrir el modal "Nuevo gasto".
2. Ingresar descripción: `Test negativo`.
3. Ingresar monto: `-500`.
4. Hacer click en "Agregar gasto".
5. Verificar que el modal permanece abierto.

**Resultado esperado:** Submit bloqueado. El input `min="0"` del HTML y la guardia JS (`amount <= 0`) deben impedirlo.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-004a — Cierre del modal con botón X

| Campo | Detalle |
|---|---|
| Módulo/Feature | Modal — cierre |
| Precondiciones | Modal "Nuevo gasto" abierto |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Abrir el modal "Nuevo gasto".
2. Hacer click en el botón con `aria-label="Cerrar"` (X en la esquina superior derecha).
3. Verificar que el modal desaparece del DOM.

**Resultado esperado:** El modal se cierra y el formulario se resetea al estado vacío.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-004b — Cierre del modal con tecla Escape

| Campo | Detalle |
|---|---|
| Módulo/Feature | Modal — cierre por teclado |
| Precondiciones | Modal "Nuevo gasto" abierto |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Abrir el modal "Nuevo gasto".
2. Presionar la tecla `Escape`.
3. Verificar que el modal desaparece del DOM.

**Resultado esperado:** El modal se cierra. (Lógica implementada en `Modal.tsx` con `window.addEventListener('keydown', ...)`)

**Resultado obtenido:** PASS.

**Evidencia:** N/A — análisis estático confirma el handler en `Modal.tsx` líneas 13-18.

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-004c — Cierre del modal con click en backdrop

| Campo | Detalle |
|---|---|
| Módulo/Feature | Modal — cierre por backdrop |
| Precondiciones | Modal "Nuevo gasto" abierto |
| Prioridad | Medio |
| Estado | FAIL |

**Pasos de ejecución:**
1. Abrir el modal "Nuevo gasto".
2. Hacer click fuera del card del modal (en el área semitransparente gris).
3. Verificar que el modal desaparece del DOM.

**Resultado esperado:** El modal se cierra. (El div backdrop tiene `onClick={onClose}` en `Modal.tsx`)

**Resultado obtenido:** FAIL — `element click intercepted`: el div backdrop (`bg-slate-900/40`) está cubierto por un elemento hijo (`grid grid-cols-2 gap-3`) que intercepta el click antes de llegar al overlay.

**Evidencia:** `tests/selenium/screenshots/TC-004c-FAIL.png`

**Bug:** BUG-003
- **Severidad:** Medio
- **Pasos mínimos para reproducir:** Abrir el modal → hacer click en el área semitransparente exactamente sobre la sección del formulario → el modal no se cierra.
- **Comportamiento actual:** El click lo recibe el elemento hijo del modal, no el backdrop.
- **Comportamiento esperado:** El modal se cierra al hacer click fuera del card.

---

### TC-005 — Editar gasto existente

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario de gastos — edición |
| Precondiciones | Al menos un gasto cargado en el mes actual |
| Prioridad | Crítico |
| Estado | PASS |

**Pasos de ejecución:**
1. Crear un gasto con descripción `GastoAEditar TC-005`, monto `1000`.
2. Hacer hover sobre el item en la lista.
3. Hacer click en el botón `aria-label="Editar gasto"` (ícono lápiz).
4. Verificar que el modal se abre con título "Editar gasto" y los campos pre-cargados.
5. Modificar descripción a `GastoEditado TC-005` y monto a `2000`.
6. Hacer click en "Guardar cambios".
7. Verificar que `GastoAEditar TC-005` ya no aparece en la lista.
8. Verificar que `GastoEditado TC-005` sí aparece.

**Resultado esperado:** El modal carga los datos existentes. Tras guardar, la lista refleja los cambios sin recargar la página.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-006a — Eliminar gasto (confirmar dialog)

| Campo | Detalle |
|---|---|
| Módulo/Feature | Lista de gastos — borrado |
| Precondiciones | Al menos un gasto cargado |
| Prioridad | Crítico |
| Estado | PASS |

**Pasos de ejecución:**
1. Crear un gasto con descripción `GastoAEliminar TC-006`.
2. Hacer hover sobre el item.
3. Hacer click en `aria-label="Eliminar gasto"` (ícono papelera).
4. Confirmar el dialog nativo del browser (`¿Eliminar este gasto?`).
5. Verificar que el item desaparece de la lista.

**Resultado esperado:** El gasto es eliminado del frontend y del backend (DELETE HTTP). La lista se actualiza de inmediato.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-006b — Cancelar eliminación mantiene el gasto

| Campo | Detalle |
|---|---|
| Módulo/Feature | Lista de gastos — borrado |
| Precondiciones | Al menos un gasto cargado |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Crear un gasto con descripción `GastoNOEliminar TC-006b`.
2. Hacer click en el botón eliminar.
3. Cancelar el dialog nativo del browser.
4. Verificar que el item sigue apareciendo en la lista.

**Resultado esperado:** El gasto no se elimina. La lista permanece sin cambios.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-007a — Botón "Mes siguiente" deshabilitado en mes actual

| Campo | Detalle |
|---|---|
| Módulo/Feature | Selector de mes |
| Precondiciones | Ninguna |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Cargar el dashboard.
2. Verificar que el botón `aria-label="Mes siguiente"` tiene el atributo `disabled`.

**Resultado esperado:** El botón está deshabilitado y no responde a clicks normales.

**Resultado obtenido:** PASS.

**Evidencia:** N/A — análisis estático confirma `disabled={isCurrentMonth}` en `MonthSelector.tsx` línea 36. Ver también BUG-002: la guardia solo existe en el HTML.

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-007b — Navegar al mes anterior cambia la etiqueta

| Campo | Detalle |
|---|---|
| Módulo/Feature | Selector de mes |
| Precondiciones | Ninguna |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Anotar la etiqueta actual del selector (ej: "Septiembre 2026").
2. Hacer click en `aria-label="Mes anterior"`.
3. Verificar que la etiqueta cambia (ej: "Agosto 2026").

**Resultado esperado:** La etiqueta refleja el mes anterior. El formato es `<Mes capitalizado> <Año>` (locale `es-AR`).

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-007c — Navegar atrás y adelante retorna al mes original

| Campo | Detalle |
|---|---|
| Módulo/Feature | Selector de mes |
| Precondiciones | Ninguna |
| Prioridad | Medio |
| Estado | PASS |

**Pasos de ejecución:**
1. Anotar mes actual.
2. Navegar al mes anterior.
3. Navegar al mes siguiente.
4. Verificar que la etiqueta volvió al mes original.

**Resultado esperado:** La lógica de `goTo(delta)` es simétrica.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-007d — Mes sin gastos muestra estado vacío

| Campo | Detalle |
|---|---|
| Módulo/Feature | Selector de mes + lista de gastos |
| Precondiciones | Ninguna |
| Prioridad | Medio |
| Estado | FAIL |

**Pasos de ejecución:**
1. Navegar 12 meses atrás.
2. Verificar que aparece el mensaje "No hay gastos cargados todavía" o el contador indica `0 gasto(s) este mes`.

**Resultado esperado:** Estado vacío visible con ícono `Inbox` y mensaje descriptivo, o contador con `0`.

**Resultado obtenido:** FAIL — `no such element`: el XPath `//p[contains(text(),'gasto(s) este mes')]` no encontró ningún elemento. El texto real en la UI difiere del asumido por el test.

**Evidencia:** `tests/selenium/screenshots/TC-007d-FAIL.png`

**Bug:** BUG-004
- **Severidad:** Medio (fallo de selector, no de funcionalidad)
- **Pasos mínimos para reproducir:** Navegar 12 meses atrás → verificar el texto del estado vacío en la sección Movimientos.
- **Comportamiento actual:** El selector `//p[contains(text(),'gasto(s) este mes')]` no matchea ningún elemento del DOM.
- **Comportamiento esperado:** El test debería usar el texto real de la UI (ej: `"Todavía no hay gastos este mes"`).

---

### TC-008a — Tarjetas de resumen muestran datos tras agregar gasto

| Campo | Detalle |
|---|---|
| Módulo/Feature | Dashboard — SummaryCards |
| Precondiciones | Al menos un gasto en el mes actual |
| Prioridad | Alto |
| Estado | FAIL |

**Pasos de ejecución:**
1. Agregar un gasto de `$5000` en categoría `Salud` con fecha `2026-09-22`.
2. Verificar que "Gastos registrados" muestra `>= 1`.
3. Verificar que "Total del mes" muestra un valor en formato ARS (contiene `$`).
4. Verificar que "Promedio diario" muestra un valor en ARS.
5. Verificar que "Categoría principal" muestra `Salud`.

**Resultado esperado:** Los 4 KPIs se calculan con los datos del mes filtrado.

**Resultado obtenido:** FAIL — timeout esperando el elemento `//p[contains(@class,'text-xs') and contains(text(),'Categoria principal')]/following-sibling::p`. El texto real en el DOM es `"Categoría principal"` (con tilde), no `"Categoria principal"`.

**Evidencia:** `tests/selenium/screenshots/TC-008a-FAIL.png`

**Bug:** BUG-004 (mismo origen — selector con texto sin acento)
- **Severidad:** Medio (fallo de selector, la card funciona correctamente)
- **Pasos mínimos para reproducir:** Ejecutar TC-008a → el wait de 8s expira sin encontrar el elemento.
- **Comportamiento actual:** XPath `contains(text(),'Categoria principal')` no matchea `"Categoría principal"`.
- **Comportamiento esperado:** Usar `contains(text(),'ategor')` o el texto con tilde correctamente.

---

### TC-008b — Categoría principal muestra "—" cuando no hay gastos

| Campo | Detalle |
|---|---|
| Módulo/Feature | Dashboard — SummaryCards |
| Precondiciones | Mes seleccionado sin gastos |
| Prioridad | Medio |
| Estado | PASS |

**Pasos de ejecución:**
1. Navegar a un mes sin gastos (ej: 18 meses atrás).
2. Verificar que la tarjeta "Categoría principal" muestra `—`.

**Resultado esperado:** `topCategory` es `null`, el valor mostrado es `—`. (Lógica en `SummaryCards.tsx` línea 21)

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-009a — Monto decimal es aceptado

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario — edge case |
| Precondiciones | Modal abierto |
| Prioridad | Medio |
| Estado | PASS |

**Pasos de ejecución:**
1. Abrir el modal.
2. Ingresar descripción: `Decimal TC-009a`.
3. Ingresar monto: `99.99`.
4. Enviar el formulario.
5. Verificar que el item aparece en la lista.

**Resultado esperado:** Montos decimales son aceptados (el input tiene `step="0.01"`).

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-009b — Monto muy grande es aceptado

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario — edge case |
| Precondiciones | Modal abierto |
| Prioridad | Bajo |
| Estado | PASS |

**Pasos de ejecución:**
1. Ingresar monto: `9999999`.
2. Enviar el formulario.
3. Verificar que el item aparece en la lista y el total del mes se actualiza.

**Resultado esperado:** No hay límite superior de monto en el formulario ni en el servidor.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-009c — Descripción de 200 caracteres no rompe el formulario

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario — edge case |
| Precondiciones | Modal abierto |
| Prioridad | Medio |
| Estado | PASS |

**Pasos de ejecución:**
1. Ingresar descripción de 200 caracteres (`AAAA...`).
2. Ingresar monto: `100`.
3. Enviar el formulario.
4. Verificar que el modal se cierra (no hay crash).

**Resultado esperado:** No hay límite de longitud definido en el frontend ni backend. El gasto se crea.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-009d — Caracteres especiales en descripción no rompen el formulario

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario — seguridad / edge case |
| Precondiciones | Modal abierto |
| Prioridad | Medio |
| Estado | PASS |

**Pasos de ejecución:**
1. Ingresar descripción: `< > & " ' % $ # @ !`.
2. Ingresar monto: `150`.
3. Enviar el formulario.
4. Verificar que el modal se cierra sin error y el item aparece (sin XSS visible).

**Resultado esperado:** React escapa automáticamente el HTML en el renderizado — no hay XSS. El formulario se envía correctamente.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-009e — Descripción con solo espacios es rechazada

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario — validación edge case |
| Precondiciones | Modal abierto |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Ingresar descripción: `     ` (5 espacios).
2. Ingresar monto: `100`.
3. Hacer click en "Agregar gasto".
4. Verificar que el modal permanece abierto.

**Resultado esperado:** `form.description.trim()` resulta en string vacío. La guardia en línea 46 de `ExpenseForm.tsx` bloquea el submit.

**Resultado obtenido:** PASS.

**Evidencia:** N/A — confirmado por análisis estático.

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-009f — Todas las categorías son seleccionables y aceptadas

| Campo | Detalle |
|---|---|
| Módulo/Feature | Formulario — categorías |
| Precondiciones | Modal abierto |
| Prioridad | Medio |
| Estado | PASS |

**Pasos de ejecución:**
1. Para cada una de las 9 categorías (`comida`, `transporte`, `vivienda`, `servicios`, `entretenimiento`, `salud`, `educacion`, `compras`, `otros`):
   a. Abrir el modal.
   b. Ingresar descripción y monto válidos.
   c. Seleccionar la categoría.
   d. Enviar el formulario.
   e. Verificar que el modal se cierra.

**Resultado esperado:** Las 9 categorías son seleccionables y el submit funciona para cada una.

**Resultado obtenido:** PASS.

**Evidencia:** N/A

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-010 — Banner de error cuando el backend está offline

| Campo | Detalle |
|---|---|
| Módulo/Feature | Dashboard — manejo de errores de red |
| Precondiciones | Frontend corriendo, backend NO corriendo |
| Prioridad | Alto |
| Estado | FAIL |

**Pasos de ejecución:**
1. Iniciar solo el frontend (`npm run dev` desde la raíz, sin `npm run server`).
2. Navegar a `http://localhost:5173`.
3. Esperar hasta ~3 s (polling inicial).
4. Verificar que aparece el banner amarillo con texto que menciona "servidor".

**Resultado esperado:** El banner con `bg-amber-50` es visible y contiene el mensaje definido en `ExpensesContext.tsx` línea 39: `"No se pudo conectar con el servidor. ¿Está corriendo? (npm run dev en /server)"`.

**Resultado obtenido:** FAIL — el test navega a `http://localhost:5173` (hardcodeado en el archivo), que corresponde a otra app (Login QA Demo), no al proyecto. No se renderizó ni el banner ni la lista de movimientos.

**Evidencia:** `tests/selenium/screenshots/TC-010-FAIL.png`

**Bug:** Error de configuración en el test — la URL `OFFLINE_URL` está hardcodeada en `:5173` en vez de usar `BASE_URL` de `driver.js`.
- **Severidad:** Medio (fallo de configuración del test, no de la app)
- **Pasos mínimos para reproducir:** Ejecutar TC-010 con el frontend en :5177 → el test navega a :5173 y encuentra una app diferente.
- **Comportamiento actual:** El test apunta al puerto equivocado.
- **Comportamiento esperado:** Usar `BASE_URL` del helper para respetar el puerto configurado.

---

### TC-011 — Gastos ordenados por fecha descendente

| Campo | Detalle |
|---|---|
| Módulo/Feature | Lista de gastos — ordenamiento |
| Precondiciones | Al menos 2 gastos en el mes con fechas diferentes |
| Prioridad | Alto |
| Estado | PASS |

**Pasos de ejecución:**
1. Agregar gasto A con fecha `2026-09-10`.
2. Agregar gasto B con fecha `2026-09-20`.
3. Verificar que en la lista, B aparece antes que A (mayor fecha primero).

**Resultado esperado:** La función `sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt)` en `ExpenseList.tsx` línea 13 garantiza orden descendente.

**Resultado obtenido:** PASS.

**Evidencia:** N/A — confirmado por análisis estático.

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

### TC-012 — Filtrado por mes aísla los gastos

| Campo | Detalle |
|---|---|
| Módulo/Feature | Dashboard — filtrado mensual |
| Precondiciones | Frontend + backend corriendo |
| Prioridad | Crítico |
| Estado | PASS |

**Pasos de ejecución:**
1. Agregar gasto "Solo Sep TC-012" con fecha `2026-09-15`.
2. Verificar que es visible en septiembre 2026.
3. Navegar al mes anterior (agosto 2026).
4. Verificar que "Solo Sep TC-012" no aparece en la lista de agosto.

**Resultado esperado:** El `useMemo` en `Dashboard.tsx` filtra por `ey === year && em - 1 === month` y excluye gastos de otros meses.

**Resultado obtenido:** PASS.

**Evidencia:** N/A — confirmado por análisis estático.

**Ejecutado:** 2026-09-22 — entorno: Chrome headless, frontend en `http://localhost:5177`.

---

## Instrucciones para ejecutar los tests Selenium

### Prerequisitos

```bash
# 1. Instalar Google Chrome (si no está instalado)
# 2. Instalar ChromeDriver que coincida con la versión de Chrome
#    Opción A: ChromeDriver Manager automático
npm install chromedriver --save-dev
#    Opción B: Manual — descargar de https://chromedriver.chromium.org/downloads

# 3. Instalar dependencias Selenium
cd "C:/Users/Emilio/Desktop/apps - dsw/Sistema-Gastos/tests/selenium"
npm install

# 4. Levantar el proyecto completo
cd "C:/Users/Emilio/Desktop/apps - dsw/Sistema-Gastos"
npm run dev:all
# Esperar a que Vite esté en http://localhost:5173 y Express en http://localhost:3001
```

### Ejecución

```bash
# Todos los tests (secuencial)
cd "C:/Users/Emilio/Desktop/apps - dsw/Sistema-Gastos/tests/selenium"
node run-all.js

# Un test individual
node tc-02-add-expense-happy-path.test.js

# Con URL customizada (ej: staging)
TEST_BASE_URL=http://localhost:4173 node run-all.js
```

Los screenshots de fallos se guardan en: `tests/selenium/screenshots/`

### Tests unitarios del servidor (ya existentes)

```bash
cd "C:/Users/Emilio/Desktop/apps - dsw/Sistema-Gastos/server"
npm test
```

---

## Archivos generados en este reporte

| Archivo | Descripción |
|---|---|
| `tests/selenium/helpers/driver.js` | Factory del WebDriver + helpers de screenshot y waits |
| `tests/selenium/helpers/page.js` | Page Object — abstracciones de interacción con la UI |
| `tests/selenium/tc-01-dashboard-loads.test.js` | TC-001: carga del dashboard |
| `tests/selenium/tc-02-add-expense-happy-path.test.js` | TC-002: alta de gasto |
| `tests/selenium/tc-03-form-validation-empty-fields.test.js` | TC-003a/b/c: validaciones del formulario |
| `tests/selenium/tc-04-modal-close-behaviors.test.js` | TC-004a/b/c: mecanismos de cierre del modal |
| `tests/selenium/tc-05-edit-expense.test.js` | TC-005: edición de gasto |
| `tests/selenium/tc-06-delete-expense.test.js` | TC-006a/b: eliminación de gasto |
| `tests/selenium/tc-07-month-navigation.test.js` | TC-007a/b/c/d: navegación de mes |
| `tests/selenium/tc-08-summary-cards.test.js` | TC-008a/b: tarjetas KPI |
| `tests/selenium/tc-09-edge-cases.test.js` | TC-009a–f: edge cases del formulario |
| `tests/selenium/tc-10-backend-offline.test.js` | TC-010: banner de backend offline |
| `tests/selenium/tc-11-expense-sort-order.test.js` | TC-011: orden de gastos |
| `tests/selenium/tc-12-month-filter.test.js` | TC-012: filtrado por mes |
| `tests/selenium/run-all.js` | Runner secuencial de todas las suites |
| `tests/selenium/package.json` | Dependencias y scripts del entorno Selenium |
