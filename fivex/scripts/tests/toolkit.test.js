import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { validateName, parseFields } from '../toolkit/lib/names.js'
import { createPlan, executePlan } from '../toolkit/lib/plan.js'
import { compareContracts, pathsMatch } from '../toolkit/lib/contracts.js'
import { parseLeadingJson } from '../toolkit/commands/maintain.js'

describe('maintenance JSON parsing', () => {
  test('reads the JSON object and ignores a trailing text summary', () => {
    const stdout = '{\n  "missingImports": []\n}\n\nSummary\n-------\nCreated: 0\n'
    assert.deepEqual(parseLeadingJson(stdout), { missingImports: [] })
  })

  test('rejects output with no JSON object', () => {
    assert.throws(() => parseLeadingJson('Source directory not found'))
  })
})

describe('toolkit names', () => {
  test('rejects path traversal and non-kebab names', () => {
    assert.throws(() => validateName('../evil'))
    assert.throws(() => validateName('Bad_Name'))
    assert.equal(validateName('toolkit-demo'), 'toolkit-demo')
  })

  test('rejects duplicate field names', () => {
    assert.throws(() => parseFields('title:string,title:number'))
  })
})

describe('toolkit plan safety', () => {
  let dir

  before(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toolkit-plan-'))
  })

  after(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })

  test('dry-run writes nothing', () => {
    const file = path.join(dir, 'dry', 'a.ts')
    const plan = createPlan()
    plan.addFile(file, 'export const a = 1\n')

    const result = executePlan(plan, { dryRun: true })

    assert.equal(result.ok, true)
    assert.equal(result.entries[0].action, 'preview-create')
    assert.equal(fs.existsSync(file), false)
  })

  test('a conflict aborts the run and writes nothing, even for other files', () => {
    const existing = path.join(dir, 'conflict', 'existing.ts')
    const fresh = path.join(dir, 'conflict', 'fresh.ts')
    fs.mkdirSync(path.dirname(existing), { recursive: true })
    fs.writeFileSync(existing, 'hand-written\n')

    const plan = createPlan()
    plan.addFile(fresh, 'generated\n')
    plan.addFile(existing, 'generated\n')
    const result = executePlan(plan)

    assert.equal(result.ok, false)
    assert.equal(fs.existsSync(fresh), false)
    assert.equal(fs.readFileSync(existing, 'utf8'), 'hand-written\n')
  })

  test('re-running an identical plan reports unchanged', () => {
    const file = path.join(dir, 'repeat', 'b.ts')
    const build = () => {
      const plan = createPlan()
      plan.addFile(file, 'export const b = 2\n')
      return plan
    }

    executePlan(build())
    const second = executePlan(build())

    assert.equal(second.ok, true)
    assert.equal(second.entries[0].action, 'unchanged')
  })

  test('a patch writes a backup of the original before modifying', () => {
    const file = path.join(dir, 'patch', 'app.ts')
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, 'original\n')

    const plan = createPlan()
    plan.addPatch(file, (current) => ({ content: `${current}added\n`, changed: true, reason: 'test' }))
    const result = executePlan(plan, { stamp: 'test-stamp' })

    assert.equal(result.ok, true)
    assert.equal(fs.readFileSync(file, 'utf8'), 'original\nadded\n')
    assert.equal(fs.readFileSync(`${file}.bak-test-stamp`, 'utf8'), 'original\n')
  })
})

describe('toolkit contract scanner', () => {
  test('matches parameterised paths and reports a mismatch', () => {
    assert.equal(pathsMatch('/api/admin/items/:id', '/api/admin/items/${id}'), true)

    const backendRoutes = [{ method: 'GET', path: '/api/admin/items', file: 'x', guarded: true, mount: '/api/admin/items' }]
    const frontendCalls = [
      { method: 'GET', path: '/api/admin/items', file: 'a' },
      { method: 'POST', path: '/api/admin/missing', file: 'b' },
    ]
    const { unmatchedCalls, unusedRoutes } = compareContracts(backendRoutes, frontendCalls)

    assert.deepEqual(unmatchedCalls.map((call) => call.path), ['/api/admin/missing'])
    assert.equal(unusedRoutes.length, 0)
  })
})
