/**
 * TC-004 — Cierre del modal
 * Verifica los tres mecanismos de cierre: botón X, tecla Escape, click en backdrop.
 */

import assert from 'node:assert/strict'
import { buildDriver, screenshot, BASE_URL } from './helpers/driver.js'
import { By, Key, until } from 'selenium-webdriver'
import {
  navigateTo,
  clickNuevoGasto,
  waitForModal,
  closeModalWithX,
} from './helpers/page.js'

let driver

async function setup() {
  driver = await buildDriver()
}

async function teardown() {
  if (driver) await driver.quit()
}

async function modalIsGone(modal) {
  try {
    await modal.isDisplayed()
    return false
  } catch {
    return true // stale element = gone
  }
}

async function test_closeWithX() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  const modal = await waitForModal(driver)
  assert.ok(await modal.isDisplayed(), 'Modal debe estar abierto')

  await closeModalWithX(driver)
  await driver.sleep(400)
  assert.ok(await modalIsGone(modal), 'Modal debe cerrarse al presionar X')
  console.log('  PASS: TC-004a Cierre con boton X')
}

async function test_closeWithEscape() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  const modal = await waitForModal(driver)

  await driver.actions().sendKeys(Key.ESCAPE).perform()
  await driver.sleep(400)
  assert.ok(await modalIsGone(modal), 'Modal debe cerrarse con Escape')
  console.log('  PASS: TC-004b Cierre con tecla Escape')
}

async function test_closeWithBackdrop() {
  await navigateTo(driver, BASE_URL)
  await clickNuevoGasto(driver)
  await waitForModal(driver)

  // Click the backdrop overlay via JS to bypass child element interception
  const backdrop = await driver.wait(
    until.elementLocated(By.xpath("//div[contains(@class,'absolute') and contains(@class,'inset-0') and contains(@class,'bg-slate')]")),
    8000,
  )
  await driver.executeScript('arguments[0].click()', backdrop)
  await driver.sleep(400)

  const modals = await driver.findElements(By.xpath("//h2[text()='Nuevo gasto']"))
  assert.equal(modals.length, 0, 'Modal debe cerrarse al hacer click en el backdrop')
  console.log('  PASS: TC-004c Cierre con click en backdrop')
}

;(async () => {
  await setup()
  let failed = false
  for (const [label, fn] of [
    ['TC-004a', test_closeWithX],
    ['TC-004b', test_closeWithEscape],
    ['TC-004c', test_closeWithBackdrop],
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
