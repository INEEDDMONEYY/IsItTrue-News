import { test } from 'node:test'
import assert from 'node:assert/strict'
import { countryAt } from '../services/countryBoundary.service.js'

test('resolves a point inside a country', () => {
  assert.equal(countryAt(48.8566, 2.3522), 'FR')
  assert.equal(countryAt(47.9, 106.9), 'MN')
})

test('resolves an enclave rather than the country surrounding it', () => {
  assert.equal(countryAt(43.94, 12.45), 'SM')
  assert.equal(countryAt(41.9, 12.5), 'IT')
})

test('returns null for open ocean', () => {
  assert.equal(countryAt(0, -160), null)
})
