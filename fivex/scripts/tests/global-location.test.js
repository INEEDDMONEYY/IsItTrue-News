import { test, describe, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import ts from 'typescript'
import {
  CONTRACT_FILE,
  BOUNDARY_FILE,
  SEED_FILE,
  loadContract,
  loadSeed,
  validateAssociations,
  validateContract,
  validateCoordinates,
  validateSeed,
} from '../toolkit/lib/global-location.js'
import { runGlobalLocation } from '../toolkit/commands/global-location.js'
import { locationBackendFiles } from '../toolkit/templates/global-location-backend.js'
import { locationFrontendFiles } from '../toolkit/templates/global-location-frontend.js'

const REAL_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..')
const tempRoots = []

after(() => {
  for (const root of tempRoots) fs.rmSync(root, { recursive: true, force: true })
})

function write(root, rel, content) {
  const abs = path.join(root, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
}

function fixtureRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'global-location-'))
  tempRoots.push(root)
  write(root, CONTRACT_FILE, fs.readFileSync(path.join(REAL_ROOT, CONTRACT_FILE), 'utf8'))
  write(root, SEED_FILE, fs.readFileSync(path.join(REAL_ROOT, SEED_FILE), 'utf8'))
  write(root, BOUNDARY_FILE, fs.readFileSync(path.join(REAL_ROOT, BOUNDARY_FILE), 'utf8'))
  write(
    root,
    'backend/app.ts',
    "import express from 'express'\nimport { notFound } from './middleware/notFound.js'\n\nexport const app = express()\napp.use(notFound)\n",
  )
  return root
}

function transpileErrors(name, source) {
  const result = ts.transpileModule(source, {
    reportDiagnostics: true,
    fileName: name,
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  })
  return (result.diagnostics ?? []).map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'))
}

describe('global location contract and seed', () => {
  test('the shipped contract and seed are valid', () => {
    assert.deepEqual(validateContract(loadContract(REAL_ROOT)), [])
    assert.deepEqual(validateSeed(loadSeed(REAL_ROOT)), [])
  })

  test('rejects a seed with a duplicated location id', () => {
    const seed = structuredClone(loadSeed(REAL_ROOT))
    seed.locations.push(structuredClone(seed.locations[0]))
    assert.ok(validateSeed(seed).some((message) => /duplicate/i.test(message)))
  })

  test('rejects placeholder, half-specified, and out-of-range coordinates', () => {
    assert.ok(validateCoordinates(0, 0).length > 0)
    assert.ok(validateCoordinates(91, 0).length > 0)
    assert.ok(validateCoordinates(51.5, null).length > 0)
    assert.deepEqual(validateCoordinates(null, null), [])
  })

  test('rejects duplicate associations and unknown locations', () => {
    const locations = new Map([['city:2643743', { id: 'city:2643743' }]])
    const errors = validateAssociations(
      [
        { locationId: 'city:2643743', relationshipType: 'coverage' },
        { locationId: 'city:2643743', relationshipType: 'coverage' },
        { locationId: 'city:999', relationshipType: 'coverage' },
      ],
      locations,
    )
    assert.ok(errors.some((message) => /duplicate/.test(message)))
    assert.ok(errors.some((message) => /does not exist/.test(message)))
  })
})

describe('generated location files', () => {
  test('backend TypeScript has no syntax diagnostics', () => {
    for (const [name, source] of Object.entries(locationBackendFiles())) {
      assert.deepEqual(transpileErrors(name, source), [], name)
    }
  })

  test('frontend TypeScript has no syntax diagnostics', () => {
    for (const [name, source] of Object.entries(locationFrontendFiles())) {
      assert.deepEqual(transpileErrors(name, source), [], name)
    }
  })
})

describe('global-location command', () => {
  test('dry run reports files and writes nothing', () => {
    const root = fixtureRoot()
    const { exitCode, output } = runGlobalLocation({ dryRun: true }, root)
    assert.equal(exitCode, 0)
    assert.match(output, /backend\/modules\/locations\/constants\.ts/)
    assert.equal(fs.existsSync(path.join(root, 'backend/modules/locations/constants.ts')), false)
  })

  test('creates files, is idempotent on repeat, and refuses to overwrite a changed file', () => {
    const root = fixtureRoot()
    assert.equal(runGlobalLocation({}, root).exitCode, 0)
    assert.ok(fs.existsSync(path.join(root, 'backend/modules/locations/data/locations.seed.json')))
    assert.ok(fs.existsSync(path.join(root, 'backend/modules/locations/data/countryBoundaries.json')))
    assert.ok(fs.existsSync(path.join(root, 'backend/modules/locations/services/countryBoundary.service.ts')))
    assert.ok(fs.existsSync(path.join(root, 'src/features/locations/components/LocationModal.tsx')))

    assert.equal(runGlobalLocation({}, root).exitCode, 0, 'repeat run should be a no-op')

    write(root, 'backend/modules/locations/constants.ts', '// edited by hand\n')
    const conflict = runGlobalLocation({}, root)
    assert.equal(conflict.exitCode, 1)
    assert.equal(fs.readFileSync(path.join(root, 'backend/modules/locations/constants.ts'), 'utf8'), '// edited by hand\n')
  })

  test('--register mounts /api/locations once', () => {
    const root = fixtureRoot()
    assert.equal(runGlobalLocation({ register: true }, root).exitCode, 0)
    assert.equal(runGlobalLocation({ register: true }, root).exitCode, 0)
    const app = fs.readFileSync(path.join(root, 'backend/app.ts'), 'utf8')
    assert.equal(app.split("app.use('/api/locations'").length - 1, 1)
  })

  test('invalid contract blocks all writes', () => {
    const root = fixtureRoot()
    const contract = JSON.parse(fs.readFileSync(path.join(root, CONTRACT_FILE), 'utf8'))
    contract.levels = []
    write(root, CONTRACT_FILE, JSON.stringify(contract))
    const { exitCode } = runGlobalLocation({}, root)
    assert.equal(exitCode, 1)
    assert.equal(fs.existsSync(path.join(root, 'backend/modules/locations/constants.ts')), false)
  })
})
