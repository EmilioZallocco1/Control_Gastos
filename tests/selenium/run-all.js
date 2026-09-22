/**
 * Sequential runner for all Selenium test suites.
 * Runs each file as a child process so driver failures in one suite
 * don't affect the others.
 *
 * Usage:  node run-all.js
 *         TEST_BASE_URL=http://localhost:5173 node run-all.js
 */

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const suites = [
  'tc-01-dashboard-loads.test.js',
  'tc-02-add-expense-happy-path.test.js',
  'tc-03-form-validation-empty-fields.test.js',
  'tc-04-modal-close-behaviors.test.js',
  'tc-05-edit-expense.test.js',
  'tc-06-delete-expense.test.js',
  'tc-07-month-navigation.test.js',
  'tc-08-summary-cards.test.js',
  'tc-09-edge-cases.test.js',
  'tc-10-backend-offline.test.js',
  'tc-11-expense-sort-order.test.js',
  'tc-12-month-filter.test.js',
]

let passed = 0
let failed = 0

for (const suite of suites) {
  const filePath = path.join(__dirname, suite)
  console.log(`\n--- Running ${suite} ---`)
  const result = spawnSync(process.execPath, [filePath], {
    stdio: 'inherit',
    env: { ...process.env },
  })
  if (result.status === 0) {
    passed++
  } else {
    failed++
  }
}

console.log('\n========================================')
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${suites.length} suites`)
console.log('========================================')

if (failed > 0) process.exit(1)
