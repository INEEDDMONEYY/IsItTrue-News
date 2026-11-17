import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitLocationQuery } from '../services/location.service.js'

test('splits a city and region on the comma', () => {
  assert.deepEqual(splitLocationQuery('Austin, Texas'), { city: 'Austin', regions: ['Texas'] })
})

test('keeps a plain query as a city with no region', () => {
  assert.deepEqual(splitLocationQuery('Texas'), { city: 'Texas', regions: [] })
})

test('ignores an empty region after a trailing comma', () => {
  assert.deepEqual(splitLocationQuery('Nome,'), { city: 'Nome', regions: [] })
})
