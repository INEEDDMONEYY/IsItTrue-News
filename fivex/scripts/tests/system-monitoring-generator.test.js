import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { registerSystemRoutes } from '../utils/route-registration.js'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SCRIPT = path.join(PROJECT_ROOT, 'scripts/generators/generate-system-monitoring.js')
const RUN_ID = `${process.pid}-${Date.now()}`
const ROOT = `src/features/_system-monitoring-tests-${RUN_ID}`
const ROOT_ABS = path.join(PROJECT_ROOT, ROOT)

function run(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: PROJECT_ROOT, encoding: 'utf8' })
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { recursive: true })
    .map(String)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isFile())
}

before(() => {
  fs.mkdirSync(ROOT_ABS, { recursive: true })
})

after(() => {
  fs.rmSync(ROOT_ABS, { recursive: true, force: true })
})

describe('system monitoring generator', () => {
  test('rejects a root outside src/ and writes nothing', () => {
    const result = run(['--root=scripts', '--no-register'])
    assert.notEqual(result.status, 0)
    assert.equal(fs.existsSync(path.join(PROJECT_ROOT, 'scripts/system')), false)
  })

  test('dry run writes nothing', () => {
    const dryRoot = `${ROOT}/dry`
    const result = run(['--dry-run', `--root=${dryRoot}`, '--no-register'])
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /nothing written/)
    assert.equal(fs.existsSync(path.join(PROJECT_ROOT, dryRoot)), false)
  })

  test('replaces zero-byte stubs and never overwrites existing files', () => {
    const root = `${ROOT}/real`
    const systemDir = path.join(PROJECT_ROOT, root, 'system')
    fs.mkdirSync(path.join(systemDir, 'pages'), { recursive: true })
    const existing = path.join(systemDir, 'types/monitoring.types.ts')
    fs.mkdirSync(path.dirname(existing), { recursive: true })
    fs.writeFileSync(existing, '// hand-written, keep me\n')
    const stub = path.join(systemDir, 'pages/SystemHealthPage.tsx')
    fs.writeFileSync(stub, '')

    const first = run([`--root=${root}`, '--no-register'])
    assert.equal(first.status, 0, first.stderr)
    assert.equal(fs.readFileSync(existing, 'utf8'), '// hand-written, keep me\n')
    assert.ok(fs.statSync(stub).size > 0, 'zero-byte stub should be replaced')
    assert.match(first.stdout, /Replaced zero-byte placeholders/)

    const before = listFiles(systemDir).map((file) => [file, fs.readFileSync(path.join(systemDir, file), 'utf8')])
    const second = run([`--root=${root}`, '--no-register'])
    assert.equal(second.status, 0, second.stderr)
    assert.match(second.stdout, /Created \(0\)/)
    const after = listFiles(systemDir).map((file) => [file, fs.readFileSync(path.join(systemDir, file), 'utf8')])
    assert.deepEqual(after, before)
  })
})

describe('system route registration', () => {
  const anchorSource = [
    "import { AuditLogsPage } from '@/features/admin/audit-logs/pages/AuditLogsPage'",
    '',
    'export const router = createBrowserRouter([',
    '  {',
    '    children: [',
    "      { path: 'audit-logs', element: <AuditLogsPage /> },",
    '    ],',
    '  },',
    '])',
    '',
  ].join('\n')
  const importPath = '@/features/admin/system/routes'

  test('adds the import and route entry once', () => {
    const first = registerSystemRoutes(anchorSource, importPath)
    assert.equal(first.changed, true)
    assert.equal(first.content.split(`from '${importPath}'`).length - 1, 1)
    assert.match(first.content, /systemRoutes,/)
    const second = registerSystemRoutes(first.content, importPath)
    assert.equal(second.changed, false)
    assert.equal(second.content, first.content)
  })

  test('throws when the audit-logs anchor is missing', () => {
    assert.throws(() => registerSystemRoutes('export const router = createBrowserRouter([])', importPath))
  })
})
