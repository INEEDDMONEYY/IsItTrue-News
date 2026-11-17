import { test, describe, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const RUN_ID = `${process.pid}-${Date.now()}`
const ROOT = `src/features/_script-tests-${RUN_ID}`
const ROOT_ABS = path.join(PROJECT_ROOT, ROOT)
const COMPILE_TSCONFIG = path.join(PROJECT_ROOT, `tsconfig.script-tests-${RUN_ID}.json`)
const CONTRACT_ABS = path.join(os.tmpdir(), `script-tests-${RUN_ID}.contract.json`)

const SCRIPTS = {
  feature: 'scripts/generators/frontend/generate-feature.js',
  page: 'scripts/generators/frontend/generate-page.js',
  component: 'scripts/generators/frontend/generate-component.js',
  api: 'scripts/generators/frontend/generate-api-module.js',
  setup: 'scripts/generators/fullstack/setup-feature.js',
}

function run(script, args) {
  return spawnSync(process.execPath, [path.join(PROJECT_ROOT, SCRIPTS[script]), ...args], {
    cwd: PROJECT_ROOT,
    encoding: 'utf8',
  })
}

function listFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { recursive: true })
    .map(String)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isFile())
    .sort()
}

function featureDir(feature) {
  return path.join(ROOT_ABS, feature)
}

before(() => {
  fs.mkdirSync(ROOT_ABS, { recursive: true })
  fs.writeFileSync(CONTRACT_ABS, JSON.stringify({
    resource: 'ScriptTestApi',
    operations: [
      {
        name: 'listItems',
        method: 'GET',
        path: '/api/script-test-items',
        responseType: 'ScriptTestItem[]',
      },
      {
        name: 'getItem',
        method: 'GET',
        path: '/api/script-test-items/{id}',
        pathParams: ['id'],
        responseType: 'ScriptTestItem',
      },
    ],
    types: [
      {
        name: 'ScriptTestItem',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'title', type: 'string' },
        ],
      },
    ],
  }, null, 2))
})

after(() => {
  fs.rmSync(ROOT_ABS, { recursive: true, force: true })
  fs.rmSync(COMPILE_TSCONFIG, { force: true })
  fs.rmSync(CONTRACT_ABS, { force: true })
})

describe('feature generator', () => {
  test('rejects path traversal in feature names', () => {
    const result = run('feature', ['--feature=../evil', `--root=${ROOT}`])
    assert.equal(result.status, 1)
    assert.equal(fs.existsSync(path.join(ROOT_ABS, '..', 'evil')), false)
  })

  test('rejects unknown layers', () => {
    const result = run('feature', ['--feature=bad-layer', '--layers=bogus', `--root=${ROOT}`])
    assert.equal(result.status, 1)
    assert.deepEqual(listFiles(featureDir('bad-layer')), [])
  })

  test('dry run writes nothing', () => {
    const result = run('feature', ['--feature=dry-run-feature', '--dry-run', `--root=${ROOT}`])
    assert.equal(result.status, 0)
    assert.match(result.stdout, /No files were written/)
    assert.equal(fs.existsSync(featureDir('dry-run-feature')), false)
  })

  test('does not overwrite existing files on re-run', () => {
    const args = ['--feature=overwrite-feature', `--root=${ROOT}`, '--layers=types']
    assert.equal(run('feature', args).status, 0)

    const target = listFiles(featureDir('overwrite-feature'))[0]
    assert.ok(target, 'expected a generated types file')
    const absolute = path.join(featureDir('overwrite-feature'), target)
    fs.writeFileSync(absolute, '// user edit\n')

    const second = run('feature', args)
    assert.equal(second.status, 0)
    assert.match(second.stdout, /\[SKIP\]/)
    assert.equal(fs.readFileSync(absolute, 'utf8'), '// user edit\n')
  })
})

describe('page generator', () => {
  test('rejects path traversal in feature names', () => {
    const result = run('page', ['--feature=../x', '--name=Bad', '--type=list', `--root=${ROOT}`])
    assert.equal(result.status, 1)
  })

  test('dry run writes nothing', () => {
    const result = run('page', ['--feature=page-dry', '--name=PageDry', '--type=list', '--dry-run', `--root=${ROOT}`])
    assert.equal(result.status, 0)
    assert.equal(fs.existsSync(featureDir('page-dry')), false)
  })

  test('writes a page and prints route guidance without overwriting on re-run', () => {
    const args = ['--feature=page-real', '--name=PageReal', '--type=list', `--root=${ROOT}`]
    const first = run('page', args)
    assert.equal(first.status, 0)
    assert.match(first.stdout, /path:/)

    const files = listFiles(featureDir('page-real'))
    assert.ok(files.length > 0, 'expected generated page files')
    const absolute = path.join(featureDir('page-real'), files[0])
    fs.writeFileSync(absolute, '// keep me\n')

    const second = run('page', args)
    assert.equal(second.status, 0)
    assert.equal(fs.readFileSync(absolute, 'utf8'), '// keep me\n')
  })
})

describe('component generator', () => {
  test('rejects path traversal in component names', () => {
    const result = run('component', ['--feature=comp-feature', '--name=../Evil', '--type=card', `--root=${ROOT}`])
    assert.equal(result.status, 1)
  })

  test('dry run writes nothing', () => {
    const result = run('component', ['--feature=comp-dry', '--name=CompDry', '--type=card', '--dry-run', `--root=${ROOT}`])
    assert.equal(result.status, 0)
    assert.equal(fs.existsSync(featureDir('comp-dry')), false)
  })
})

describe('api module generator', () => {
  test('generates functions that use the shared apiClient', () => {
    const result = run('api', ['--feature=script-test-api', `--contract=${CONTRACT_ABS}`, `--root=${ROOT}`])
    assert.equal(result.status, 0, result.stderr)

    const source = listFiles(featureDir('script-test-api'))
      .map((file) => fs.readFileSync(path.join(featureDir('script-test-api'), file), 'utf8'))
      .join('\n')

    assert.match(source, /from '@\/api\/client'/)
    assert.match(source, /export const scriptTestApiApi = \{/)
    assert.match(source, /const \{ data \} = await apiClient\.get/)
    assert.match(source, /encodeURIComponent\(id\)/)
  })

  test('sample advertising contract validates against the real pricing endpoint', () => {
    const result = run('api', ['--feature=advertising', '--contract=scripts/contracts/advertising.contract.json', '--dry-run', `--root=${ROOT}`])
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /AdvertiserPricing/)
  })

  test('rejects contract paths without the /api prefix', () => {
    const badContract = path.join(os.tmpdir(), `script-tests-${RUN_ID}.bad.json`)
    fs.writeFileSync(badContract, JSON.stringify({
      resource: 'BadApi',
      types: [],
      operations: [{ name: 'list', method: 'GET', path: '/items', responseType: 'string' }],
    }))
    try {
      const result = run('api', ['--feature=bad-api', `--contract=${badContract}`, `--root=${ROOT}`])
      assert.equal(result.status, 1)
      assert.equal(fs.existsSync(featureDir('bad-api')), false)
    } finally {
      fs.rmSync(badContract, { force: true })
    }
  })
})

describe('setup feature', () => {
  test('stops when the feature generator fails and does not run the page generator', () => {
    const result = run('setup', ['--feature=../bad', '--with-page', `--root=${ROOT}`])
    assert.equal(result.status, 1)
    assert.doesNotMatch(result.stdout, /Running page generator/)
  })

  test('skips the page generator when the pages layer already creates the page', () => {
    const result = run('setup', ['--feature=setup-pages', '--with-page', '--dry-run', `--root=${ROOT}`])
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /skipping page generator/)
    assert.doesNotMatch(result.stdout, /Running page generator/)
  })

  test('runs the page generator when the pages layer is not selected', () => {
    const result = run('setup', ['--feature=setup-nopage', '--with-page', '--layers=types', '--dry-run', `--root=${ROOT}`])
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /Running page generator/)
  })
})

describe('generated code compiles', () => {
  test('feature, page, component, and api output type-checks', () => {
    const feature = 'compile-check'
    assert.equal(run('feature', ['--feature=compile-check', `--root=${ROOT}`]).status, 0)
    assert.equal(run('page', ['--feature=compile-check', '--name=CompileCheck', '--type=list', `--root=${ROOT}`]).status, 0)
    assert.equal(run('component', ['--feature=compile-check', '--name=CompileCard', '--type=card', `--root=${ROOT}`]).status, 0)
    assert.equal(run('api', ['--feature=compile-check', `--contract=${CONTRACT_ABS}`, `--root=${ROOT}`]).status, 0)

    fs.writeFileSync(COMPILE_TSCONFIG, JSON.stringify({
      extends: './tsconfig.app.json',
      compilerOptions: { noEmit: true, incremental: false },
      include: [`${ROOT}/${feature}`],
    }, null, 2))

    const tsc = spawnSync(process.execPath, [
      path.join(PROJECT_ROOT, 'node_modules/typescript/bin/tsc'),
      '-p', COMPILE_TSCONFIG,
    ], {
      cwd: PROJECT_ROOT,
      encoding: 'utf8',
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=4096' },
      maxBuffer: 10 * 1024 * 1024,
    })

    assert.equal(tsc.status, 0, `tsc failed:\n${tsc.stdout}${tsc.stderr}`)
  })
})
