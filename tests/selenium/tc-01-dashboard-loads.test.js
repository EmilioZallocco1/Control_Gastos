/**
 * TC-001 — Dashboard carga correctamente
 * Verifica que la SPA renderiza todos los elementos clave al cargar.
 */

import assert from 'node:assert/strict'
import { buildDriver, screenshot, BASE_URL } from './helpers/driver.js'
import { By, until } from 'selenium-webdriver'

const TIMEOUT = 10000

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_dashboardLoads() {
  await driver.get(BASE_URL)

  // H1 title visible
  const h1 = await driver.wait(
    until.elementLocated(By.xpath("//h1[contains(text(),'Mis Gastos')]")),
    TIMEOUT,
  )
  assert.ok(await h1.isDisplayed(), 'H1 "Mis Gastos" debe ser visible')

  // "Nuevo gasto" button
  const addBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[.//span[text()='Nuevo gasto']]")),
    TIMEOUT,
  )
  assert.ok(await addBtn.isDisplayed(), 'Boton "Nuevo gasto" debe ser visible')

  // Month selector
  const monthSelector = await driver.wait(
    until.elementLocated(By.xpath("//button[@aria-label='Mes anterior']")),
    TIMEOUT,
  )
  assert.ok(await monthSelector.isDisplayed(), 'Selector de mes debe ser visible')

  // Summary cards (4 expected)
  const cards = await driver.findElements(By.xpath("//p[contains(@class,'text-xs') and contains(@class,'font-medium')]"))
  assert.ok(cards.length >= 4, `Deben existir al menos 4 tarjetas de resumen, encontradas: ${cards.length}`)

  // Empty state message in expense list
  const emptyMsg = await driver.findElements(By.xpath("//*[contains(text(),'No hay gastos cargados')]"))
  // Either the empty state OR actual expense items are present — both are valid
  const expenseItems = await driver.findElements(By.xpath("//button[@aria-label='Editar gasto']"))
  assert.ok(
    emptyMsg.length > 0 || expenseItems.length > 0,
    'Debe mostrarse estado vacío o lista de gastos',
  )

  console.log('  PASS: TC-001 Dashboard carga correctamente')
}

// ----- runner -----
;(async () => {
  await setup()
  try {
    await test_dashboardLoads()
  } catch (err) {
    const dest = await screenshot(driver, 'TC-001-FAIL')
    console.error(`  FAIL: TC-001 — ${err.message}`)
    if (dest) console.error(`  Screenshot: ${dest}`)
    process.exitCode = 1
  } finally {
    await teardown()
  }
})()
