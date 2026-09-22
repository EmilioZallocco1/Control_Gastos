/**
 * TC-011 — Orden de gastos en la lista
 * Los gastos deben ordenarse por fecha descendente; dentro del mismo día, por createdAt descendente.
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
  submitExpenseForm,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function test_expensesSortedByDateDescending() {
  await navigateTo(driver, BASE_URL)

  // Add older expense first
  await clickNuevoGasto(driver)
  await waitForModal(driver)
  await fillDescription(driver, 'Primero TC-011 (fecha antigua)')
  await fillAmount(driver, 100)
  await fillDate(driver, '2026-09-10')
  await submitExpenseForm(driver)
  await driver.sleep(400)

  // Add newer expense
  await clickNuevoGasto(driver)
  await waitForModal(driver)
  await fillDescription(driver, 'Segundo TC-011 (fecha reciente)')
  await fillAmount(driver, 200)
  await fillDate(driver, '2026-09-20')
  await submitExpenseForm(driver)
  await driver.sleep(400)

  // Get all expense description elements in DOM order
  const descEls = await driver.findElements(
    By.xpath("//p[contains(@class,'font-semibold') and contains(@class,'text-slate-700')]"),
  )
  const texts = []
  for (const el of descEls) {
    texts.push(await el.getText())
  }

  const idxOlder = texts.findIndex((t) => t.includes('TC-011 (fecha antigua)'))
  const idxNewer = texts.findIndex((t) => t.includes('TC-011 (fecha reciente)'))

  assert.ok(idxNewer !== -1, 'El gasto con fecha reciente debe estar en la lista')
  assert.ok(idxOlder !== -1, 'El gasto con fecha antigua debe estar en la lista')
  assert.ok(
    idxNewer < idxOlder,
    `El gasto mas reciente (pos ${idxNewer}) debe aparecer antes que el mas antiguo (pos ${idxOlder})`,
  )

  console.log('  PASS: TC-011 Gastos ordenados por fecha descendente')
}

;(async () => {
  await setup()
  try {
    await test_expensesSortedByDateDescending()
  } catch (err) {
    const dest = await screenshot(driver, 'TC-011-FAIL')
    console.error(`  FAIL: TC-011 — ${err.message}`)
    if (dest) console.error(`  Screenshot: ${dest}`)
    process.exitCode = 1
  } finally {
    await teardown()
  }
})()
