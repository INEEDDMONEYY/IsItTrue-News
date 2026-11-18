import { test } from 'node:test'
import assert from 'node:assert/strict'
import { topInterestCategories } from '../services/forYou.service.js'

test('ranks categories by saves (weight 2) above likes (weight 1)', () => {
  const ranked = topInterestCategories([
    { id: 'a', category: 'Politics', bookmarked: false, liked: true },
    { id: 'b', category: 'Health', bookmarked: true, liked: false },
  ])
  assert.deepEqual(ranked, ['Health', 'Politics'])
})

test('ignores entries with no engagement and caps the list', () => {
  const ranked = topInterestCategories(
    [
      { id: 'a', category: 'A', bookmarked: true, liked: false },
      { id: 'b', category: 'B', bookmarked: true, liked: false },
      { id: 'c', category: 'C', bookmarked: true, liked: false },
      { id: 'd', category: 'D', bookmarked: false, liked: false },
    ],
    2,
  )
  assert.equal(ranked.length, 2)
  assert.ok(!ranked.includes('D'))
})

test('returns no categories for an anonymous or cold-start reader', () => {
  assert.deepEqual(topInterestCategories([]), [])
})
