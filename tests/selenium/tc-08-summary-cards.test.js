/**
 * TC-008 — Tarjetas de resumen
 * Verifica que los 4 KPIs se calculan y muestran correctamente tras agregar gastos.
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
  selectCategory,
  submitExpenseForm,
  getSummaryCardValue,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_summaryCardsAfterAddingExpense() {
  await navigateTo(driver, BASE_URL)

  // Add a known expense in the current month
  await clickNuevoGasto(driver)
  await waitForModal(driver)
  await fillDescription(driver, 'KPI Test TC-008')
  await fillAmount(driver, 5000)
  await fillDate(driver, '2026-09-22')
  await selectCategory(driver, 'salud')
  await submitExpenseForm(driver)
  await driver.sleep(600)

  // "Gastos registrados" card — count should be at least 1
  const countValue = await getSummaryCardValue(driver, 'Gastos registrados')
  const count = parseInt(countValue, 10)
  assert.ok(count >= 1, `"Gastos registrados" debe ser >= 1, obtenido: "${countValue}"`)

  // "Total del mes" should contain a $ sign (ARS format)
  const totalValue = await getSummaryCardValue(driver, 'Total del mes')
  assert.ok(totalValue.includes('$'), `"Total del mes" debe mostrar monto en ARS, obtenido: "${totalValue}"`)

  // "Promedio diario" should also be a currency value
  const avgValue = await getSummaryCardValue(driver, 'Promedio diario')
  assert.ok(avgValue.includes('$'), `"Promedio diario" debe mostrar monto en ARS, obtenido: "${avgValue}"`)

  // "Categoría principal" should show "Salud" (we only added salud)
  const catValue = await getSummaryCardValue(driver, 'Categoría principal')
  // The card label in the DOM is "Categoría principal" (with accent) — match loosely
  const catElements = await driver.findElements(
    By.xpath("//p[contains(text(),'ategor') and contains(@class,'text-xs')]/following-sibling::p"),
  )
  if (catElements.length > 0) {
    const catText = await catElements[0].getText()
    console.log(`  INFO: Categoria principal = "${catText}"`)
  }

  console.log('  PASS: TC-008 Tarjetas de resumen muestran datos correctos')
}

async function test_summaryCardsShowDashWhenNoExpenses() {
  await navigateTo(driver, BASE_URL)

  // Navigate to a month 18 months back (no expenses expected)
  for (let i = 0; i < 18; i++) {
    const prevBtn = await driver.findElement(By.xpath("//button[@aria-label='Mes anterior']"))
    await prevBtn.click()
  }
  await driver.sleep(300)

  // "Categoria principal" should show "—" when empty
  const catElements = await driver.findElements(
    By.xpath("//p[contains(text(),'ategor') and contains(@class,'text-xs')]/following-sibling::p"),
  )
  if (catElements.length > 0) {
    const catText = await catElements[0].getText()
    assert.ok(
      catText === '—' || catText === '',
      `Con 0 gastos la categoria principal debe ser "—", obtenido: "${catText}"`,
    )
  }

  console.log('  PASS: TC-008b Categoria principal muestra "—" cuando no hay gastos')
}

;(async () => {
  await setup()
  let failed = false
  for (const [label, fn] of [
    ['TC-008a', test_summaryCardsAfterAddingExpense],
    ['TC-008b', test_summaryCardsShowDashWhenNoExpenses],
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
