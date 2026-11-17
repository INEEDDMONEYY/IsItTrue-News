import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { matchLocationIds, type MatchablePlace } from '../services/articleLocationBackfill.service.js'

const places: MatchablePlace[] = [
  { locationId: 'country:SG', level: 'country', name: 'Singapore', aliases: [], countryCode: 'SG' },
  { locationId: 'city:1880252', level: 'city', name: 'Singapore', aliases: [], countryCode: 'SG' },
  { locationId: 'country:GB', level: 'country', name: 'United Kingdom', aliases: ['UK'], countryCode: 'GB' },
  { locationId: 'admin_division:NG-LA', level: 'admin_division', name: 'Lagos State', aliases: ['Lagos'], countryCode: 'NG' },
  { locationId: 'city:2332459', level: 'city', name: 'Lagos', aliases: [], countryCode: 'NG' },
  { locationId: 'city:2643743', level: 'city', name: 'London', aliases: [], countryCode: 'GB' },
]

const article = (overrides: Partial<{ title: string; excerpt: string; body: string }>) => ({
  title: '',
  excerpt: '',
  body: '',
  ...overrides,
})

describe('article location matching', () => {
  it('prefers the most specific level when one name maps to city and country', () => {
    const ids = matchLocationIds(article({ title: 'Singapore reports growth' }), places)
    assert.deepEqual(ids, ['city:1880252'])
  })

  it('matches short all-caps aliases only when case matches', () => {
    assert.deepEqual(matchLocationIds(article({ body: '<p>The UK government said</p>' }), places), ['country:GB'])
    assert.deepEqual(matchLocationIds(article({ body: 'uk weather was mild' }), places), [])
  })

  it('requires whole-word matches so substrings do not match', () => {
    assert.deepEqual(matchLocationIds(article({ body: 'Londonderry was quiet' }), places), [])
  })

  it('returns no matches for unrelated text', () => {
    assert.deepEqual(matchLocationIds(article({ title: 'Election results', body: 'Nothing here' }), places), [])
  })
})
