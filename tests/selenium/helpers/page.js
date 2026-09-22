/**
 * Page Object helpers — thin wrappers over common UI interactions.
 * Each function is self-contained and uses explicit waits only.
 */

import { By, until } from 'selenium-webdriver'
import { waitFor, TIMEOUT } from './driver.js'

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

export async function navigateTo(driver, url) {
  await driver.get(url)
  // Wait until the page title is rendered (h1 "Mis Gastos")
  await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(),'Mis Gastos')]")), TIMEOUT)
}

// ---------------------------------------------------------------------------
// Header / "Nuevo gasto" button
// ---------------------------------------------------------------------------

export async function clickNuevoGasto(driver) {
  // The button may show only the Plus icon on mobile — use aria-label fallback
  const btn = await driver.wait(
    until.elementLocated(By.xpath("//button[.//span[text()='Nuevo gasto'] or @aria-label='Nuevo gasto']")),
    TIMEOUT,
  )
  await driver.wait(until.elementIsEnabled(btn), TIMEOUT)
  await btn.click()
}

// ---------------------------------------------------------------------------
// Modal / ExpenseForm
// ---------------------------------------------------------------------------

export async function waitForModal(driver) {
  return driver.wait(
    until.elementLocated(By.xpath("//h2[text()='Nuevo gasto' or text()='Editar gasto']")),
    TIMEOUT,
  )
}

export async function closeModalWithEscape(driver) {
  const { Key } = await import('selenium-webdriver')
  await driver.actions().sendKeys(Key.ESCAPE).perform()
}

export async function closeModalWithX(driver) {
  const btn = await driver.wait(
    until.elementLocated(By.xpath("//button[@aria-label='Cerrar']")),
    TIMEOUT,
  )
  await btn.click()
}

export async function fillDescription(driver, text) {
  const input = await driver.wait(
    until.elementLocated(By.xpath("//input[@placeholder='Ej: Supermercado']")),
    TIMEOUT,
  )
  await input.clear()
  await input.sendKeys(text)
}

export async function fillAmount(driver, amount) {
  const input = await driver.wait(
    until.elementLocated(By.xpath("//input[@type='number']")),
    TIMEOUT,
  )
  await input.clear()
  await input.sendKeys(String(amount))
}

export async function fillDate(driver, isoDate) {
  const input = await driver.wait(
    until.elementLocated(By.xpath("//input[@type='date']")),
    TIMEOUT,
  )
  await input.clear()
  // Selenium needs to set the value via JS for date inputs on some browsers
  await driver.executeScript(
    "arguments[0].value = arguments[1]; arguments[0].dispatchEvent(new Event('input', {bubbles:true})); arguments[0].dispatchEvent(new Event('change', {bubbles:true}));",
    input,
    isoDate,
  )
}

export async function selectCategory(driver, categoryValue) {
  const select = await driver.wait(
    until.elementLocated(By.xpath("//select")),
    TIMEOUT,
  )
  const { Select } = await import('selenium-webdriver/lib/select.js')
  const sel = new Select(select)
  await sel.selectByValue(categoryValue)
}

export async function submitExpenseForm(driver) {
  const btn = await driver.wait(
    until.elementLocated(
      By.xpath("//button[@type='submit'][contains(text(),'Agregar gasto') or contains(text(),'Guardar cambios')]"),
    ),
    TIMEOUT,
  )
  await driver.wait(until.elementIsEnabled(btn), TIMEOUT)
  await btn.click()
}

export async function cancelExpenseForm(driver) {
  const btn = await driver.wait(
    until.elementLocated(By.xpath("//button[@type='button'][text()='Cancelar']")),
    TIMEOUT,
  )
  await btn.click()
}

// ---------------------------------------------------------------------------
// Expense list
// ---------------------------------------------------------------------------

export async function getExpenseItems(driver) {
  // Each item has an aria-label="Editar gasto" button inside
  return driver.findElements(By.xpath("//button[@aria-label='Editar gasto']/ancestor::div[contains(@class,'group')]"))
}

export async function getExpenseItemByDescription(driver, description) {
  return driver.wait(
    until.elementLocated(
      By.xpath(`//p[contains(@class,'font-semibold') and contains(text(),'${description}')]`),
    ),
    TIMEOUT,
  )
}

export async function clickEditOnItem(driver, description) {
  // Hover the item to make the action buttons visible, then click edit
  const item = await getExpenseItemByDescription(driver, description)
  await driver.actions().move({ origin: item }).perform()
  const editBtn = await driver.wait(
    until.elementLocated(
      By.xpath(`//p[contains(text(),'${description}')]/ancestor::div[contains(@class,'group')]//button[@aria-label='Editar gasto']`),
    ),
    TIMEOUT,
  )
  await editBtn.click()
}

export async function clickDeleteOnItem(driver, description) {
  const item = await getExpenseItemByDescription(driver, description)
  await driver.actions().move({ origin: item }).perform()
  const delBtn = await driver.wait(
    until.elementLocated(
      By.xpath(`//p[contains(text(),'${description}')]/ancestor::div[contains(@class,'group')]//button[@aria-label='Eliminar gasto']`),
    ),
    TIMEOUT,
  )
  await delBtn.click()
}

// ---------------------------------------------------------------------------
// Month selector
// ---------------------------------------------------------------------------

export async function clickMesAnterior(driver) {
  const btn = await driver.wait(
    until.elementLocated(By.xpath("//button[@aria-label='Mes anterior']")),
    TIMEOUT,
  )
  await btn.click()
}

export async function clickMesSiguiente(driver) {
  const btn = await driver.wait(
    until.elementLocated(By.xpath("//button[@aria-label='Mes siguiente']")),
    TIMEOUT,
  )
  await btn.click()
}

export async function getMonthLabel(driver) {
  const span = await driver.wait(
    until.elementLocated(By.xpath("//span[contains(@class,'min-w')]")),
    TIMEOUT,
  )
  return span.getText()
}

// ---------------------------------------------------------------------------
// Summary cards
// ---------------------------------------------------------------------------

export async function getSummaryCardValue(driver, label) {
  const card = await driver.wait(
    until.elementLocated(
      By.xpath(`//p[contains(@class,'text-xs') and contains(text(),'${label}')]/following-sibling::p`),
    ),
    TIMEOUT,
  )
  return card.getText()
}

// ---------------------------------------------------------------------------
// Error banner
// ---------------------------------------------------------------------------

export async function getErrorBanner(driver) {
  const banners = await driver.findElements(
    By.xpath("//*[contains(@class,'bg-amber-50')]"),
  )
  return banners.length > 0 ? banners[0] : null
}
