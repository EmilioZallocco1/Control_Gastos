/**
 * TC-006 — Eliminar gasto
 * Crea un gasto, lo elimina confirmando el dialog, y verifica que desaparece de la lista.
 * También verifica que cancelar el dialog NO elimina el gasto.
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
  getExpenseItemByDescription,
  clickDeleteOnItem,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_deleteExpenseConfirm() {
  await navigateTo(driver, BASE_URL)

  // Create expense
  await clickNuevoGasto(driver)
  await waitForModal(driver)
  await fillDescription(driver, 'GastoAEliminar TC-006')
  await fillAmount(driver, 500)
  await fillDate(driver, '2026-09-22')
  await submitExpenseForm(driver)
  await getExpenseItemByDescription(driver, 'GastoAEliminar TC-006')

  // Click delete — accept the native confirm dialog
  await driver.executeScript("window._confirmResult = true; window.confirm = () => window._confirmResult;")
  await clickDeleteOnItem(driver, 'GastoAEliminar TC-006')

  await driver.sleep(600)

  const items = await driver.findElements(
    By.xpath("//p[contains(text(),'GastoAEliminar TC-006')]"),
  )
  assert.equal(items.length, 0, 'El gasto debe desaparecer de la lista tras confirmar eliminacion')
  console.log('  PASS: TC-006a Eliminar gasto (confirmar)')
}

async function test_deleteExpenseCancel() {
  await navigateTo(driver, BASE_URL)

  // Create expense
  await clickNuevoGasto(driver)
  await waitForModal(driver)
  await fillDescription(driver, 'GastoNOEliminar TC-006b')
  await fillAmount(driver, 300)
  await fillDate(driver, '2026-09-22')
  await submitExpenseForm(driver)
  await getExpenseItemByDescription(driver, 'GastoNOEliminar TC-006b')

  // Click delete — CANCEL the confirm dialog
  await driver.executeScript("window.confirm = () => false;")
  await clickDeleteOnItem(driver, 'GastoNOEliminar TC-006b')

  await driver.sleep(400)

  const item = await getExpenseItemByDescription(driver, 'GastoNOEliminar TC-006b')
  assert.ok(await item.isDisplayed(), 'El gasto debe permanecer si se cancela la confirmacion')
  console.log('  PASS: TC-006b Cancelar eliminacion mantiene el gasto')
}

;(async () => {
  await setup()
  let failed = false
  for (const [label, fn] of [
    ['TC-006a', test_deleteExpenseConfirm],
    ['TC-006b', test_deleteExpenseCancel],
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
