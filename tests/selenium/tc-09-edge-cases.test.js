/**
 * TC-009 — Edge cases del formulario
 * Valores límite, strings largos, caracteres especiales, montos decimales.
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

async function test_decimalAmount() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  await waitForModal(driver)

  await fillDescription(driver, 'Decimal TC-009a')
  await fillAmount(driver, 99.99)
  await fillDate(driver, '2026-09-22')
  await submitExpenseForm(driver)

  // Should succeed — item appears in list
  const item = await driver.wait(
    until.elementLocated(By.xpath("//p[contains(text(),'Decimal TC-009a')]")),
    8000,
  )
  assert.ok(await item.isDisplayed(), 'Gasto con monto decimal debe agregarse correctamente')
  console.log('  PASS: TC-009a Monto decimal aceptado')
}

async function test_veryLargeAmount() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  await waitForModal(driver)

  await fillDescription(driver, 'Grande TC-009b')
  await fillAmount(driver, 9999999)
  await fillDate(driver, '2026-09-22')
  await submitExpenseForm(driver)

  const item = await driver.wait(
    until.elementLocated(By.xpath("//p[contains(text(),'Grande TC-009b')]")),
    8000,
  )
  assert.ok(await item.isDisplayed(), 'Gasto con monto muy grande debe agregarse correctamente')
  console.log('  PASS: TC-009b Monto muy grande aceptado')
}

async function test_longDescription() {
  const longDesc = 'A'.repeat(200) + ' TC-009c'
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  await waitForModal(driver)

  await fillDescription(driver, longDesc)
  await fillAmount(driver, 100)
  await fillDate(driver, '2026-09-22')
  await submitExpenseForm(driver)

  await driver.sleep(600)
  // We don't assert the full 200-char string in the DOM since it truncates visually,
  // just assert the form closed (no error crash)
  const modals = await driver.findElements(By.xpath("//h2[text()='Nuevo gasto']"))
  assert.equal(modals.length, 0, 'El formulario debe cerrarse incluso con descripcion muy larga')
  console.log('  PASS: TC-009c Descripcion larga (200 chars) no rompe el formulario')
}

async function test_specialCharactersInDescription() {
  const specialDesc = '< > & " \' % $ # @ ! TC-009d'
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  await waitForModal(driver)

  await fillDescription(driver, specialDesc)
  await fillAmount(driver, 150)
  await fillDate(driver, '2026-09-22')
  await submitExpenseForm(driver)

  await driver.sleep(600)
  // The modal should close without error (no XSS / crash)
  const modals = await driver.findElements(By.xpath("//h2[text()='Nuevo gasto']"))
  assert.equal(modals.length, 0, 'El formulario debe cerrarse con caracteres especiales en descripcion')
  console.log('  PASS: TC-009d Caracteres especiales no rompen el formulario')
}

async function test_whitespaceOnlyDescription() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  const modal = await waitForModal(driver)

  // Only whitespace — the form logic does .trim() and rejects empty
  await fillDescription(driver, '     ')
  await fillAmount(driver, 100)
  await fillDate(driver, '2026-09-22')
  await submitExpenseForm(driver)

  await driver.sleep(500)
  const stillOpen = await modal.isDisplayed().catch(() => false)
  assert.ok(stillOpen, 'Descripcion con solo espacios debe bloquear el submit')
  console.log('  PASS: TC-009e Descripcion con solo espacios es rechazada')
}

async function test_allCategoriesSelectable() {
  const categories = [
    'comida', 'transporte', 'vivienda', 'servicios',
    'entretenimiento', 'salud', 'educacion', 'compras', 'otros',
  ]

  for (const cat of categories) {
    await navigateTo(driver, BASE_URL)
    await clickNuevoGasto(driver)
    await waitForModal(driver)
    await fillDescription(driver, `Cat ${cat} TC-009f`)
    await fillAmount(driver, 10)
    await fillDate(driver, '2026-09-22')
    await selectCategory(driver, cat)
    await submitExpenseForm(driver)
    await driver.sleep(400)

    const modals = await driver.findElements(By.xpath("//h2[text()='Nuevo gasto']"))
    assert.equal(modals.length, 0, `Categoria "${cat}" debe permitir submit exitoso`)
  }
  console.log('  PASS: TC-009f Todas las categorias son seleccionables y aceptadas')
}

;(async () => {
  await setup()
  let failed = false
  for (const [label, fn] of [
    ['TC-009a', test_decimalAmount],
    ['TC-009b', test_veryLargeAmount],
    ['TC-009c', test_longDescription],
    ['TC-009d', test_specialCharactersInDescription],
    ['TC-009e', test_whitespaceOnlyDescription],
    ['TC-009f', test_allCategoriesSelectable],
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
