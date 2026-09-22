/**
 * TC-005 — Editar gasto existente
 * Crea un gasto, lo edita y verifica que los nuevos datos se reflejan en la lista.
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
  clickEditOnItem,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_editExpense() {
  await navigateTo(driver, BASE_URL)

  // Step 1: Create a new expense
  await clickNuevoGasto(driver)
  await waitForModal(driver)
  await fillDescription(driver, 'GastoAEditar TC-005')
  await fillAmount(driver, 1000)
  await fillDate(driver, '2026-09-22')
  await selectCategory(driver, 'otros')
  await submitExpenseForm(driver)

  // Wait for the item to appear
  await getExpenseItemByDescription(driver, 'GastoAEditar TC-005')

  // Step 2: Click edit
  await clickEditOnItem(driver, 'GastoAEditar TC-005')

  // Modal should open with title "Editar gasto"
  const editTitle = await driver.wait(
    until.elementLocated(By.xpath("//h2[text()='Editar gasto']")),
    8000,
  )
  assert.ok(await editTitle.isDisplayed(), 'Modal "Editar gasto" debe abrirse')

  // Step 3: Change description and amount
  await fillDescription(driver, 'GastoEditado TC-005')
  await fillAmount(driver, 2000)

  // Submit (button should say "Guardar cambios")
  const saveBtn = await driver.wait(
    until.elementLocated(By.xpath("//button[@type='submit'][contains(text(),'Guardar cambios')]")),
    8000,
  )
  await saveBtn.click()

  // Modal closes
  await driver.sleep(600)

  // Old description should be gone, new one should appear
  const oldItems = await driver.findElements(
    By.xpath("//p[contains(text(),'GastoAEditar TC-005')]"),
  )
  assert.equal(oldItems.length, 0, 'La descripcion antigua no debe aparecer tras editar')

  const newItem = await getExpenseItemByDescription(driver, 'GastoEditado TC-005')
  assert.ok(await newItem.isDisplayed(), 'La descripcion nueva debe aparecer en la lista')

  console.log('  PASS: TC-005 Editar gasto existente')
}

;(async () => {
  await setup()
  try {
    await test_editExpense()
  } catch (err) {
    const dest = await screenshot(driver, 'TC-005-FAIL')
    console.error(`  FAIL: TC-005 — ${err.message}`)
    if (dest) console.error(`  Screenshot: ${dest}`)
    process.exitCode = 1
  } finally {
    await teardown()
  }
})()
