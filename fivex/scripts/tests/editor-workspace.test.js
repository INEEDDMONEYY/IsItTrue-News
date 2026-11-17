import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  SECTIONS,
  inspectSections,
  resolveSectionIds,
  routerRegistrationPatch,
  scanNavLinks,
  WORKSPACE_ANCHOR,
} from '../toolkit/lib/editor-workspace.js'
import { runEditorWorkspace } from '../toolkit/commands/editor-workspace.js'

const ROUTER = 'src/app/routes/index.tsx'
const NAV = 'src/features/dashboard/constants/dashboardNav.ts'
const WORKSPACE_PAGE = 'src/features/editor/pages/EditorWorkspacePage.tsx'

function write(root, rel, content) {
  const abs = path.join(root, rel)
  fs.mkdirSync(path.dirname(abs), { recursive: true })
  fs.writeFileSync(abs, content)
}

describe('editor workspace section registry', () => {
  test('rejects unknown section ids', () => {
    assert.throws(() => resolveSectionIds('calendar,nope'), /Unknown section/)
    assert.deepEqual(resolveSectionIds('calendar, workspace'), ['calendar', 'workspace'])
  })

  test('blocked sections are never reported as incomplete', () => {
    const blocked = inspectSections({ root: os.tmpdir(), sectionIds: ['team-assignments', 'source-verification'] })
    assert.ok(blocked.every((item) => item.status === 'blocked'))
  })

  test('0-byte page files count as missing', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ew-'))
    try {
      write(root, WORKSPACE_PAGE, '')
      const [item] = inspectSections({ root, sectionIds: ['workspace'] })
      assert.equal(item.status, 'incomplete')
      assert.deepEqual(item.missingFiles, [WORKSPACE_PAGE])
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('sidebar link scan and router patch', () => {
  let root
  before(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'ew-nav-'))
    write(root, NAV, "{ to: '/dashboard/calendar' }, { to: '/dashboard/ghost' }, { to: '/dashboard/' }")
    write(root, ROUTER, `import { EditorialCalendarPage } from '@/features/editor/pages/EditorialCalendarPage'\n${WORKSPACE_ANCHOR}\n`)
  })
  after(() => fs.rmSync(root, { recursive: true, force: true }))

  test('reports nav links with no matching route', () => {
    const { links, broken } = scanNavLinks({ root })
    assert.deepEqual(links, ['calendar', 'ghost'])
    assert.deepEqual(broken, ['ghost'])
  })

  test('router patch adds the route and import once, then is a no-op', () => {
    const section = SECTIONS.find((s) => s.id === 'workspace')
    const patch = routerRegistrationPatch(section)
    const first = patch(fs.readFileSync(path.join(root, ROUTER), 'utf8'))
    assert.equal(first.changed, true)
    assert.match(first.content, /path: 'work-space', element: <EditorWorkspacePage \/>/)
    assert.equal(first.content.split("import { EditorWorkspacePage }").length - 1, 1)

    const second = patch(first.content)
    assert.equal(second.changed, false)
    assert.equal(second.content, first.content)
  })

  test('router patch refuses to guess when the anchor is missing', () => {
    const section = SECTIONS.find((s) => s.id === 'workspace')
    assert.throws(() => routerRegistrationPatch(section)('export const routes = []'), /anchor not found/)
  })
})

describe('editor-workspace command', () => {
  test('dry-run with --register writes nothing, and a real run is repeatable', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ew-cmd-'))
    try {
      write(root, NAV, '')
      write(root, ROUTER, `${WORKSPACE_ANCHOR}\n`)
      write(root, WORKSPACE_PAGE, 'export function EditorWorkspacePage() { return null }\n')
      const before = fs.readFileSync(path.join(root, ROUTER), 'utf8')

      runEditorWorkspace({ sections: 'workspace', dryRun: true, register: true }, root)
      assert.equal(fs.readFileSync(path.join(root, ROUTER), 'utf8'), before)

      const first = runEditorWorkspace({ sections: 'workspace', register: true }, root)
      assert.equal(first.exitCode, 0)
      const after = fs.readFileSync(path.join(root, ROUTER), 'utf8')
      assert.match(after, /path: 'work-space'/)

      runEditorWorkspace({ sections: 'workspace', register: true }, root)
      assert.equal(fs.readFileSync(path.join(root, ROUTER), 'utf8'), after)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })

  test('without --register the command never edits the router', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ew-noreg-'))
    try {
      write(root, ROUTER, `${WORKSPACE_ANCHOR}\n`)
      write(root, WORKSPACE_PAGE, 'export function EditorWorkspacePage() { return null }\n')
      const before = fs.readFileSync(path.join(root, ROUTER), 'utf8')
      runEditorWorkspace({ sections: 'workspace' }, root)
      assert.equal(fs.readFileSync(path.join(root, ROUTER), 'utf8'), before)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

describe('editor workspace contract', () => {
  test('every endpoint the sections read is declared in the contract', () => {
    const contractPath = path.resolve(import.meta.dirname, '../contracts/editor-workspace.contract.json')
    const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
    const declared = new Set(contract.operations.map((op) => `${op.method} ${op.path}`))
    const used = SECTIONS.flatMap((section) => section.endpoints.map((e) => `${e.method} ${e.path}`))
    const missing = used.filter((key) => !declared.has(key))
    assert.deepEqual(missing, [])
  })
})
