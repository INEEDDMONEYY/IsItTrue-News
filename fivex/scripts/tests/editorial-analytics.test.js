import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { SECTIONS, resolveSectionIds } from '../toolkit/lib/editorial-analytics.js'
import { routerRegistrationPatch } from '../toolkit/commands/editorial-analytics.js'
import { countAnalyticsFindings } from '../toolkit/commands/editorial-analytics-maintain.js'

describe('editorial analytics section ids', () => {
  test('resolves a comma list and rejects unknown ids', () => {
    assert.deepEqual(resolveSectionIds('overview,content-quality'), ['overview', 'content-quality'])
    assert.throws(() => resolveSectionIds('bogus'), /bogus/)
  })

  test('every section declares at least one backend endpoint', () => {
    for (const section of SECTIONS) assert.ok(section.endpoints.length > 0, section.id)
  })
})

describe('editorial analytics router patch', () => {
  const section = SECTIONS.find((item) => item.id === 'content-quality')

  test('adds the route once and reports no change on a second run', () => {
    const router = "import { DashboardAnalyticsPage } from '@/x'\n\nconst routes = [\n  { path: 'analytics', element: <DashboardAnalyticsPage /> },\n]\n"
    const first = routerRegistrationPatch(section)(router)
    assert.equal(first.changed, true)
    assert.match(first.content, /path: 'content-quality'/)

    const second = routerRegistrationPatch(section)(first.content)
    assert.equal(second.changed, false)
    assert.equal(second.content, first.content)
  })
})

describe('editorial analytics maintenance counts', () => {
  test('counts findings across every category', () => {
    const result = {
      missingImports: ['a'],
      duplicateRoutes: [],
      unresolvedImports: [],
      unreferencedPages: ['b'],
      unusedFileCandidates: [],
      incompleteSections: ['c'],
      failures: [],
    }
    assert.equal(countAnalyticsFindings(result), 3)
  })
})
