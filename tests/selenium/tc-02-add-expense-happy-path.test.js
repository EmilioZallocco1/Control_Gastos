/**
 * TC-002 — Agregar gasto (camino feliz)
 * Completa el formulario con datos válidos y verifica que el gasto aparece en la lista.
 */

import assert from 'node:assert/strict'
import { buildDriver, screenshot, BASE_URL } from './helpers/driver.js'
import { By, until } from 'selenium-webdriver'
import {
  navigateTo,
  clickNuevoGasto,
  waitForModal,
  fillDescription,
  fillAmount,
  fillDate,
  selectCategory,
  submitExpenseForm,
  getExpenseItemByDescription,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_addExpenseHappyPath() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)

  // Modal should appear
  const modal = await waitForModal(driver)
  assert.ok(await modal.isDisplayed(), 'El modal "Nuevo gasto" debe aparecer')

  // Fill in form
  await fillDescription(driver, 'Supermercado TC-002')
  await fillAmount(driver, 3500)
  await fillDate(driver, '2026-09-22')
  await selectCategory(driver, 'comida')
  await submitExpenseForm(driver)

  // Modal should close — title should disappear
  await driver.wait(
    until.stalenessOf(modal),
    8000,
    'El modal debe cerrarse tras agregar el gasto',
  )

  // Navigate to September 2026 to make sure we see this month
  // (the test runs on 2026-09-22 so the current month should already be set)

  // The expense description should appear in the list
  const item = await getExpenseItemByDescription(driver, 'Supermercado TC-002')
  assert.ok(await item.isDisplayed(), 'El gasto recien creado debe aparecer en la lista')

  console.log('  PASS: TC-002 Agregar gasto (camino feliz)')
}

;(async () => {
  await setup()
  try {
    await test_addExpenseHappyPath()
  } catch (err) {
    const dest = await screenshot(driver, 'TC-002-FAIL')
    console.error(`  FAIL: TC-002 — ${err.message}`)
    if (dest) console.error(`  Screenshot: ${dest}`)
    process.exitCode = 1
  } finally {
    await teardown()
  }
})()
