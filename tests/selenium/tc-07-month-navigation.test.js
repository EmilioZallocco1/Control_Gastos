/**
 * TC-007 — Navegación entre meses
 * Verifica que el selector de mes avanza/retrocede correctamente
 * y que el botón "siguiente" está deshabilitado en el mes actual.
 */

import assert from 'node:assert/strict'
import { buildDriver, screenshot, BASE_URL } from './helpers/driver.js'
import { By, until } from 'selenium-webdriver'
import {
  navigateTo,
  clickMesAnterior,
  clickMesSiguiente,
  getMonthLabel,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_nextMonthButtonDisabledOnCurrentMonth() {
  await navigateTo(driver, BASE_URL)

  // The "next month" button should be disabled when showing the current month
  const nextBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[@aria-label='Mes siguiente']")),
    8000,
  )
  const isDisabled = await nextBtn.getAttribute('disabled')
  assert.ok(isDisabled !== null, 'El boton "Mes siguiente" debe estar deshabilitado en el mes actual')
  console.log('  PASS: TC-007a Boton siguiente deshabilitado en mes actual')
}

async function test_navigateToPreviousMonth() {
  await navigateTo(driver, BASE_URL)

  const currentLabel = await getMonthLabel(driver)
  await clickMesAnterior(driver)

  const newLabel = await getMonthLabel(driver)
  assert.notEqual(currentLabel, newLabel, 'La etiqueta del mes debe cambiar al navegar al mes anterior')
  console.log(`  PASS: TC-007b Navegar al mes anterior: "${currentLabel}" -> "${newLabel}"`)
}

async function test_navigateBackThenForward() {
  await navigateTo(driver, BASE_URL)

  const originalLabel = await getMonthLabel(driver)
  await clickMesAnterior(driver)
  const prevLabel = await getMonthLabel(driver)
  assert.notEqual(originalLabel, prevLabel, 'Debe cambiar al mes anterior')

  await clickMesSiguiente(driver)
  const backLabel = await getMonthLabel(driver)
  assert.equal(backLabel, originalLabel, 'Debe volver al mes original al avanzar')
  console.log('  PASS: TC-007c Navegar atras y adelante vuelve al mes original')
}

async function test_emptyListForMonthWithNoExpenses() {
  await navigateTo(driver, BASE_URL)

  // Go back 12 months — very unlikely to have data there
  for (let i = 0; i < 12; i++) {
    await clickMesAnterior(driver)
  }

  await driver.sleep(300)
  const emptyMsg = await driver.findElements(
    By.xpath("//*[contains(text(),'no hay gastos') or contains(text(),'Todavía no hay') or contains(text(),'sin gastos')]"),
  )
  const zeroCount = await driver.findElements(
    By.xpath("//p[contains(@class,'text-xs') and contains(text(),'Gastos registrados')]/following-sibling::p[text()='0']"),
  )

  assert.ok(
    emptyMsg.length > 0 || zeroCount.length > 0,
    'Un mes sin datos debe mostrar estado vacio o contador 0',
  )
  console.log('  PASS: TC-007d Mes sin gastos muestra estado vacio')
}

;(async () => {
  await setup()
  let failed = false
  for (const [label, fn] of [
    ['TC-007a', test_nextMonthButtonDisabledOnCurrentMonth],
    ['TC-007b', test_navigateToPreviousMonth],
    ['TC-007c', test_navigateBackThenForward],
    ['TC-007d', test_emptyListForMonthWithNoExpenses],
  ]) {
    try {
      await fn()
    } catch (err) {
      const dest = await screenshot(driver, `${label}-FAIL`)
      console.error(`  FAIL: ${label} — ${err.message}`)
      if (dest) console.error(`  Screenshot: ${dest}`)
      failed = true
    }
  }
  await teardown()
  if (failed) process.exitCode = 1
})()
