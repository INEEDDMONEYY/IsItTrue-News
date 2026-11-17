import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../maintenance/frontend/check-routes.js',
)

function runCheck(srcRoot) {
  const stdout = execFileSync(process.execPath, [scriptPath, `--src-root=${srcRoot}`, '--json'], {
    encoding: 'utf8',
  })
  return JSON.parse(stdout)
}

describe('check-routes reachability', () => {
  test('follows imports through wrapper pages and flags only truly orphaned pages', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'check-routes-'))

    try {
      const write = (relativePath, content) => {
        const target = path.join(root, relativePath)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        fs.writeFileSync(target, content)
      }

      write(
        'app/router.tsx',
        "import { Wrapper } from '@/pages/Wrapper'\nexport const routes = [{ path: '/wrapped', element: null }]\n",
      )
      write('pages/Wrapper.tsx', "import { Deep } from './DeepPage'\nexport const Wrapper = Deep\n")
      write('pages/DeepPage.tsx', 'export const Deep = null\n')
      write('pages/OrphanPage.tsx', 'export const Orphan = null\n')

      const result = runCheck(root)
      const unreferenced = result.unreferencedPages.map((file) => path.basename(file))

      assert.deepEqual(unreferenced, ['OrphanPage.tsx'])
      assert.deepEqual(result.routes.map((route) => route.path), ['/wrapped'])
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})
