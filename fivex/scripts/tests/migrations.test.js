import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { planMerge, applyMerge } from '../migrations/merge-fact-check-verification.js'

const NAV_BLOCK = `  {
    label: 'Fact Check Verification',
    to: '/admin/fact-check-verification',
    icon: SearchCheck,
  },
`

function write(root, relative, content) {
  const full = path.join(root, relative)
  fs.mkdirSync(path.dirname(full), { recursive: true })
  fs.writeFileSync(full, content, 'utf8')
}

function buildFixture(root) {
  write(root, 'src/features/admin/fact-check-verification/api/factCheckVerification.api.ts', "export const api = {}\n")
  write(root, 'src/features/admin/fact-check-verification/hooks/useFactCheckVerification.ts', "import { api } from '../api/factCheckVerification.api'\n")
  write(root, 'src/features/admin/fact-check-verification/pages/FactCheckVerificationPage.tsx',
    "import { useFactCheckVerification } from '../hooks/useFactCheckVerification'\n")
  write(root, 'src/features/admin/fact-checks/api/factChecks.api.ts', "export const other = {}\n")
  write(root, 'src/app/routes/index.tsx',
    "import { FactCheckVerificationPage } from '@/features/admin/fact-check-verification/pages/FactCheckVerificationPage'\n" +
    "{ path: 'fact-check-verification', element: <FactCheckVerificationPage /> },\n")
  write(root, 'src/features/admin/constants/adminNav.ts',
    "import { BadgeCheck, SearchCheck } from 'lucide-react'\nexport const nav = [\n" +
    "  {\n    label: 'Fact Checks',\n    to: '/admin/fact-checks',\n    icon: BadgeCheck,\n  },\n" +
    NAV_BLOCK + "]\n")
  write(root, 'src/features/authors/api/factCheckRequests.api.ts',
    "// reviewed via the separate admin fact-check-verification API\n")
}

describe('merge-fact-check-verification', () => {
  let root

  before(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-fcv-'))
  })

  after(() => {
    fs.rmSync(root, { recursive: true, force: true })
  })

  test('dry run leaves every file in place', () => {
    buildFixture(root)
    const plan = planMerge(root)
    applyMerge(plan, { dryRun: true })

    assert.equal(plan.moves.length, 3)
    assert.ok(fs.existsSync(path.join(root, 'src/features/admin/fact-check-verification/api/factCheckVerification.api.ts')))
    assert.ok(!fs.existsSync(path.join(root, 'src/features/admin/fact-checks/api/factCheckVerification.api.ts')))
    assert.ok(fs.readFileSync(path.join(root, 'src/app/routes/index.tsx'), 'utf8').includes('fact-check-verification/pages'))
  })

  test('refuses to run when a target file already exists', () => {
    write(root, 'src/features/admin/fact-checks/hooks/useFactCheckVerification.ts', 'existing\n')

    assert.throws(() => planMerge(root), /refusing to overwrite/)
    assert.equal(
      fs.readFileSync(path.join(root, 'src/features/admin/fact-checks/hooks/useFactCheckVerification.ts'), 'utf8'),
      'existing\n',
    )
    fs.rmSync(path.join(root, 'src/features/admin/fact-checks/hooks'), { recursive: true })
  })

  test('applies moves, rewrites references, and removes the standalone nav entry', () => {
    const plan = planMerge(root)
    applyMerge(plan)

    const movedPage = fs.readFileSync(path.join(root, 'src/features/admin/fact-checks/pages/FactCheckVerificationPage.tsx'), 'utf8')
    assert.equal(movedPage, "import { useFactCheckVerification } from '../hooks/useFactCheckVerification'\n")

    const routes = fs.readFileSync(path.join(root, 'src/app/routes/index.tsx'), 'utf8')
    assert.ok(routes.includes("from '@/features/admin/fact-checks/pages/FactCheckVerificationPage'"))
    assert.ok(routes.includes("path: 'fact-checks/verification'"))

    const nav = fs.readFileSync(path.join(root, 'src/features/admin/constants/adminNav.ts'), 'utf8')
    assert.ok(!nav.includes('fact-check-verification'))
    assert.ok(!nav.includes('SearchCheck'))
    assert.ok(nav.includes("import { BadgeCheck } from 'lucide-react'"))

    assert.ok(!fs.existsSync(path.join(root, 'src/features/admin/fact-check-verification')))
  })

  test('reports leftover references that the migration does not rewrite', () => {
    const freshRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-fcv-leftover-'))
    try {
      buildFixture(freshRoot)
      write(freshRoot, 'src/features/admin/fact-checks/pages/Extra.tsx', "// see fact-check-verification docs\n")
      const plan = planMerge(freshRoot)

      const files = plan.leftovers.map((hit) => hit.file).sort()
      assert.deepEqual(files, [
        'src/features/admin/fact-checks/pages/Extra.tsx',
        'src/features/authors/api/factCheckRequests.api.ts',
      ])
    } finally {
      fs.rmSync(freshRoot, { recursive: true, force: true })
    }
  })
})
