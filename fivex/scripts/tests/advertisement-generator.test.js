import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { registerAdvertisementNav, registerAdvertisementRoutes } from '../utils/advertisement-integration.js'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SCRIPT = path.join(PROJECT_ROOT, 'scripts/generators/frontend/generate-advertisement.js')
const RUN_ID = `${process.pid}-${Date.now()}`
const ROOT = `src/features/_advertisement-tests-${RUN_ID}`
const ROOT_ABS = path.join(PROJECT_ROOT, ROOT)
const IMPORT_PATH = '@/features/admin/advertisement/routes'

function run(args) {
  return spawnSync(process.execPath, [SCRIPT, ...args], { cwd: PROJECT_ROOT, encoding: 'utf8' })
}

before(() => {
  fs.mkdirSync(ROOT_ABS, { recursive: true })
})

after(() => {
  fs.rmSync(ROOT_ABS, { recursive: true, force: true })
})

describe('advertisement generator', () => {
  test('rejects a root outside src/ and writes nothing', () => {
    const result = run(['--root=scripts', '--no-register'])
    assert.notEqual(result.status, 0)
    assert.equal(fs.existsSync(path.join(PROJECT_ROOT, 'scripts/advertisement')), false)
  })

  test('dry run writes nothing', () => {
    const dryRoot = `${ROOT}/dry`
    const result = run(['--dry-run', `--root=${dryRoot}`, '--no-register'])
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /nothing written/)
    assert.equal(fs.existsSync(path.join(PROJECT_ROOT, dryRoot)), false)
  })

  test('keeps existing files and replaces only zero-byte placeholders', () => {
    const root = `${ROOT}/real`
    const moduleDir = path.join(PROJECT_ROOT, root, 'advertisement')
    const handWritten = path.join(moduleDir, 'utils/advertisementSections.ts')
    const placeholder = path.join(moduleDir, 'routes.tsx')
    fs.mkdirSync(path.dirname(handWritten), { recursive: true })
    fs.writeFileSync(handWritten, '// hand-written, keep me\n')
    fs.writeFileSync(placeholder, '')

    const result = run([`--root=${root}`, '--no-register'])
    assert.equal(result.status, 0, result.stderr)
    assert.equal(fs.readFileSync(handWritten, 'utf8'), '// hand-written, keep me\n')
    assert.notEqual(fs.statSync(placeholder).size, 0)
    assert.match(result.stdout, /Kept existing files \(conflicts, not overwritten\) \(1\)/)
  })
})

describe('advertisement integration transforms', () => {
  const ROUTER = [
    "import { BannersPage } from '@/features/admin/banners/pages/BannersPage'",
    "import { AdvertisementCodesPage } from '@/features/admin/advertisements/pages/AdvertisementCodesPage'",
    "import { Navigate } from 'react-router-dom'",
    "export const routes = [",
    "  {",
    "    children: [",
    "      { path: 'banners', element: <BannersPage /> },",
    "      { path: 'advertisements', element: <AdvertisementCodesPage /> },",
    "    ],",
    "  },",
    "]",
  ].join('\n')

  const NAV = [
    "import { Megaphone, Code2 } from 'lucide-react'",
    'export const nav = [',
    '  {',
    "    label: 'Banners',",
    "    to: '/admin/banners',",
    '    icon: Megaphone,',
    '  },',
    '  {',
    "    label: 'Advertisement Codes',",
    "    to: '/admin/advertisements',",
    '    icon: Code2,',
    '  },',
    ']',
  ].join('\n')

  test('router registration redirects legacy routes and is idempotent', () => {
    const first = registerAdvertisementRoutes(ROUTER, IMPORT_PATH)
    assert.equal(first.changed, true)
    assert.match(first.content, /<Navigate to="\/admin\/advertisement\/banners" replace \/>/)
    assert.match(first.content, /advertisementRoutes,/)
    assert.doesNotMatch(first.content, /BannersPage \/>/)

    const second = registerAdvertisementRoutes(first.content, IMPORT_PATH)
    assert.equal(second.changed, false)
    assert.equal(second.content, first.content)
  })

  test('nav registration replaces both entries and fails when an anchor is missing', () => {
    const updated = registerAdvertisementNav(NAV)
    assert.match(updated.content, /label: 'Advertisement'/)
    assert.doesNotMatch(updated.content, /Advertisement Codes/)
    assert.doesNotMatch(updated.content, /Code2/)
    assert.equal(registerAdvertisementNav(updated.content).changed, false)

    assert.throws(() => registerAdvertisementNav('export const nav = []'), /Could not find/)
    assert.throws(() => registerAdvertisementRoutes('export const routes = []', IMPORT_PATH), /Could not find/)
  })
})
