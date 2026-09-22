/**
 * Driver factory — builds a Chrome WebDriver instance configured for E2E testing.
 * Screenshots are saved to tests/selenium/screenshots/ on failure.
 */

import { Builder, By, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'screenshots')
export const BASE_URL = process.env.TEST_BASE_URL ?? 'http://localhost:5177'

export async function buildDriver() {
  const options = new chrome.Options()
  options.addArguments('--headless=new')
  options.addArguments('--no-sandbox')
  options.addArguments('--disable-dev-shm-usage')
  options.addArguments('--window-size=1280,800')

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build()

  driver.manage().setTimeouts({ implicit: 0, pageLoad: 15000, script: 10000 })

  return driver
}

/**
 * Captures a screenshot and saves it under tests/selenium/screenshots/<name>.png.
 * Safe to call even if the driver is in a broken state — never throws.
 */
export async function screenshot(driver, name) {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true })
    const png = await driver.takeScreenshot()
    const dest = path.join(SCREENSHOTS_DIR, `${name}.png`)
    await fs.writeFile(dest, png, 'base64')
    return dest
  } catch {
    return null
  }
}

/**
 * Explicit wait helpers — use these instead of driver.sleep().
 */
export const TIMEOUT = 8000

export function waitFor(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementLocated(locator), timeout)
}

export function waitVisible(driver, locator, timeout = TIMEOUT) {
  return driver.wait(until.elementIsVisible(driver.findElement(locator)), timeout)
}

export { By, until }
