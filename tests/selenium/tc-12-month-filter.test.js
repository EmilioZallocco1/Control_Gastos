/**
 * TC-012 — Filtrado por mes
 * Gastos de un mes no deben aparecer al navegar a otro mes.
 */

import assert from 'node:assert/strict'
import { buildDriver, screenshot, BASE_URL } from './helpers/driver.js'
import { By } from 'selenium-webdriver'
import {
  navigateTo,
  clickNuevoGasto,
  waitForModal,
  fillDescription,
  fillAmount,
  fillDate,
  submitExpenseForm,
  clickMesAnterior,
  clickMesSiguiente,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_monthFilterIsolatesExpenses() {
  await navigateTo(driver, BASE_URL)

  // Add a gasto in September 2026 (current month in this test session)
  await clickNuevoGasto(driver)
  await waitForModal(driver)
  await fillDescription(driver, 'Solo Sep TC-012')
  await fillAmount(driver, 777)
  await fillDate(driver, '2026-09-15')
  await submitExpenseForm(driver)
  await driver.sleep(400)

  // Verify it's visible in current month
  const inCurrent = await driver.findElements(
    By.xpath("//p[contains(text(),'Solo Sep TC-012')]"),
  )
  assert.ok(inCurrent.length > 0, 'El gasto debe ser visible en el mes actual')

  // Go to previous month (August 2026)
  await clickMesAnterior(driver)
  await driver.sleep(300)

  // The September gasto must NOT be visible
  const inPrev = await driver.findElements(
    By.xpath("//p[contains(text(),'Solo Sep TC-012')]"),
  )
  assert.equal(
    inPrev.length,
    0,
    'El gasto de septiembre no debe aparecer cuando se muestra agosto',
  )

  console.log('  PASS: TC-012 El filtro por mes aísla los gastos correctamente')
}

;(async () => {
  await setup()
  try {
    await test_monthFilterIsolatesExpenses()
  } catch (err) {
    const dest = await screenshot(driver, 'TC-012-FAIL')
    console.error(`  FAIL: TC-012 — ${err.message}`)
    if (dest) console.error(`  Screenshot: ${dest}`)
    process.exitCode = 1
  } finally {
    await teardown()
  }
})()
