import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { ratio, average, roundTo } from '../services/editorialAnalytics.service.js'
import { resolveDateRange, editorialAnalyticsQuerySchema, reportQuerySchema } from '../validations/editorialAnalytics.validation.js'
import { csvCell, toCsv } from '../services/editorialReports.service.js'
import { visitorHash, referrerHostFrom } from '../../articles/utils/visitorIdentity.js'

describe('rate and average denominators', () => {
  it('returns null instead of dividing by zero', () => {
    assert.equal(ratio(3, 0), null)
    assert.equal(average(10, 0), null)
  })

  it('computes ratios and rounds them', () => {
    assert.equal(ratio(1, 4), 0.25)
    assert.equal(roundTo(average(10, 3), 1), 3.3)
  })
})

describe('content quality denominators', () => {
  it('reports no return-for-revision rate when there are no decisions', () => {
    assert.equal(ratio(0, 0), null)
  })

  it('reports a correction rate against published articles only', () => {
    assert.equal(roundTo(ratio(3, 4), 4), 0.75)
    assert.equal(ratio(2, 0), null)
  })
})

describe('resolveDateRange', () => {
  const now = new Date('2026-03-15T12:00:00Z')

  it('defaults to the last 30 UTC days ending today', () => {
    const range = resolveDateRange({}, now)
    assert.equal(range.to, '2026-03-15')
    assert.equal(range.from, '2026-02-14')
    assert.equal(range.end.toISOString(), '2026-03-16T00:00:00.000Z')
  })

  it('treats the end date as inclusive', () => {
    const range = resolveDateRange({ from: '2026-03-01', to: '2026-03-01' }, now)
    assert.equal(range.end.toISOString(), '2026-03-02T00:00:00.000Z')
  })
})

describe('editorialAnalyticsQuerySchema', () => {
  it('rejects impossible dates, reversed ranges, and ranges over 366 days', () => {
    assert.equal(editorialAnalyticsQuerySchema.safeParse({ from: '2026-02-30' }).success, false)
    assert.equal(editorialAnalyticsQuerySchema.safeParse({ from: '2026-03-02', to: '2026-03-01' }).success, false)
    assert.equal(editorialAnalyticsQuerySchema.safeParse({ from: '2024-01-01', to: '2026-01-01' }).success, false)
  })

  it('accepts an empty query and applies the default limit', () => {
    const parsed = editorialAnalyticsQuerySchema.safeParse({})
    assert.equal(parsed.success, true)
    assert.equal(parsed.success && parsed.data.limit, 25)
  })
})

describe('reportQuerySchema', () => {
  it('rejects unknown datasets and formats', () => {
    assert.equal(reportQuerySchema.safeParse({ dataset: 'users' }).success, false)
    assert.equal(reportQuerySchema.safeParse({ dataset: 'overview', format: 'xlsx' }).success, false)
  })

  it('accepts a known dataset and defaults to json', () => {
    const parsed = reportQuerySchema.safeParse({ dataset: 'workflow' })
    assert.equal(parsed.success, true)
    assert.equal(parsed.success && parsed.data.format, 'json')
  })
})

describe('CSV export escaping', () => {
  it('quotes values containing commas, quotes, or line breaks', () => {
    assert.equal(csvCell('Hello, "world"'), '"Hello, ""world"""')
    assert.equal(csvCell('line1\nline2'), '"line1\nline2"')
  })

  it('prefixes text that spreadsheets would evaluate as a formula', () => {
    assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"')
    assert.equal(csvCell('+1'), "'+1")
    assert.equal(csvCell('@sum'), "'@sum")
  })

  it('writes empty cells for null and undefined and does not prefix numbers', () => {
    assert.equal(csvCell(null), '')
    assert.equal(csvCell(undefined), '')
    assert.equal(csvCell(-4), '-4')
  })

  it('builds rows in column order with missing fields left blank', () => {
    const csv = toCsv(['a', 'b'], [{ b: 2, a: 'x' }, { a: 'y' }])
    assert.equal(csv, 'a,b\r\nx,2\r\ny,\r\n')
  })
})

describe('visitorHash', () => {
  const day1 = new Date('2026-03-15T08:00:00Z')
  const day2 = new Date('2026-03-16T08:00:00Z')

  it('is stable within a UTC day and rotates across days', () => {
    assert.equal(visitorHash('203.0.113.5', 'UA', day1), visitorHash('203.0.113.5', 'UA', day1))
    assert.notEqual(visitorHash('203.0.113.5', 'UA', day1), visitorHash('203.0.113.5', 'UA', day2))
  })

  it('does not contain the raw IP address', () => {
    assert.ok(!visitorHash('203.0.113.5', 'UA', day1).includes('203.0.113.5'))
  })
})

describe('referrerHostFrom', () => {
  it('keeps only the hostname without path, query, or www.', () => {
    assert.equal(referrerHostFrom('https://www.Example.com/post?token=abc'), 'example.com')
  })

  it('returns undefined for missing or invalid referrers', () => {
    assert.equal(referrerHostFrom(undefined), undefined)
    assert.equal(referrerHostFrom('not a url'), undefined)
  })
})
