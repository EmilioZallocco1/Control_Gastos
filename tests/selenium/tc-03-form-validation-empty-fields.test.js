/**
 * TC-003 — Validación de formulario: campos vacíos
 * El formulario no debe submitear si descripción o monto están vacíos.
 */

import assert from 'node:assert/strict'
import { buildDriver, screenshot, BASE_URL } from './helpers/driver.js'
import { until } from 'selenium-webdriver'
import {
  navigateTo,
  clickNuevoGasto,
  waitForModal,
  fillAmount,
  submitExpenseForm,
  fillDescription,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_emptyDescriptionPreventsSubmit() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  const modal = await waitForModal(driver)

  // Leave description empty, fill valid amount
  await fillAmount(driver, 100)
  await submitExpenseForm(driver)

  // Modal must still be open (submit blocked)
  await driver.sleep(500)
  const stillOpen = await modal.isDisplayed().catch(() => false)
  assert.ok(stillOpen, 'El modal debe permanecer abierto cuando la descripcion esta vacia')
  console.log('  PASS: TC-003a Descripcion vacia bloquea el submit')
}

async function test_zeroAmountPreventsSubmit() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  const modal = await waitForModal(driver)

  // Fill description but leave amount = 0
  await fillDescription(driver, 'Test cero')
  await fillAmount(driver, 0)
  await submitExpenseForm(driver)

  await driver.sleep(500)
  const stillOpen = await modal.isDisplayed().catch(() => false)
  assert.ok(stillOpen, 'El modal debe permanecer abierto cuando el monto es cero')
  console.log('  PASS: TC-003b Monto cero bloquea el submit')
}

async function test_negativeAmountPreventsSubmit() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  const modal = await waitForModal(driver)

  await fillDescription(driver, 'Test negativo')
  await fillAmount(driver, -500)
  await submitExpenseForm(driver)

  await driver.sleep(500)
  const stillOpen = await modal.isDisplayed().catch(() => false)
  assert.ok(stillOpen, 'El modal debe permanecer abierto cuando el monto es negativo')
  console.log('  PASS: TC-003c Monto negativo bloquea el submit')
}

;(async () => {
  await setup()
  let failed = false
  for (const [label, fn] of [
    ['TC-003a', test_emptyDescriptionPreventsSubmit],
    ['TC-003b', test_zeroAmountPreventsSubmit],
    ['TC-003c', test_negativeAmountPreventsSubmit],
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
