#!/usr/bin/env node

/**
 * IITNews Feature Generator
 *
 * Usage:
 * node scripts/generators/frontend/generate-feature.js --feature=advertising
 * node scripts/generators/frontend/generate-feature.js --feature=analytics --dry-run
 * node scripts/generators/frontend/generate-feature.js --feature=analytics --layers=pages,components,types
 * node scripts/generators/frontend/generate-feature.js --feature=reader-dashboard --root=src/features
 *
 * Paths resolve from the fivex project root, so the script can run from any directory.
 *
 * Safety:
 * - Existing files are never overwritten.
 * - Existing feature architecture is preserved.
 * - No backend endpoints are invented.
 * - Does not modify application routes automatically.
 */

import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT, resolveSourceRoot, toProjectRelative, writeFileIfMissing } from '../../utils/file-system.js'
import { toCamelCase, toPascalCase, validateFeatureName } from '../../utils/templates.js'

const args = process.argv.slice(2)

const hasFlag = (flag) => args.includes(flag)

function getOption(name, fallback = '') {
  const argument = args.find((item) => item.startsWith(`--${name}=`))
  return argument ? argument.slice(name.length + 3) : fallback
}

function toDisplayName(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

const forceHelp = hasFlag('--help')
const featureInput = getOption('feature')
let featureName = ''
let root = ''

if (!forceHelp) {
  if (!featureInput) {
    console.error('Missing feature name. Example: --feature=advertising')
    process.exit(1)
  }

  try {
    featureName = validateFeatureName(featureInput)
    root = resolveSourceRoot(getOption('root', 'src/features/admin'))
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

const featurePascal = toPascalCase(featureName)
const featureCamel = toCamelCase(featureName)
const featureDisplay = toDisplayName(featureName)

const featureRoot = path.join(root, featureName)

const dryRun = hasFlag('--dry-run')

const availableLayers = [
  'api',
  'components',
  'hooks',
  'pages',
  'services',
  'state',
  'types',
  'utils',
]

const requestedLayers = getOption('layers')
const selectedLayers = requestedLayers
  ? requestedLayers.split(',').map((layer) => layer.trim().toLowerCase())
  : availableLayers

if (forceHelp) {
  console.log(`
IITNews Feature Generator

Options:
  --feature=NAME       Required feature name.
  --root=PATH          Feature root directory.
  --layers=LIST        Comma-separated architecture layers.
  --dry-run            Preview without writing.
  --help               Show this message.

Available layers:
  ${availableLayers.join(', ')}
`)
  process.exit(0)
}

const invalidLayers = selectedLayers.filter(
  (layer) => !availableLayers.includes(layer),
)

if (invalidLayers.length > 0) {
  console.error(`Invalid layers: ${invalidLayers.join(', ')}`)
  process.exit(1)
}

const files = new Map()

function addFile(relativePath, content) {
  files.set(relativePath, content)
}

function createTypes() {
  return `/**
 * ${featureDisplay} feature types.
 *
 * Add backend response and request types here when their contracts
 * are available. Avoid duplicating shared application types.
 */

export interface ${featurePascal}Record {
  id: string
  createdAt?: string
  updatedAt?: string
}

export interface ${featurePascal}Filters {
  search: string
}

export interface ${featurePascal}ListResponse {
  data: ${featurePascal}Record[]
  total: number
}
`
}

function createPage() {
  return `/**
 * ${featureDisplay} page.
 *
 * Generated starter page. Connect this page to the feature's
 * existing services and hooks before adding management actions.
 */

export function ${featurePascal}Page() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-heading">
          ${featureDisplay}
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Manage ${featureDisplay.toLowerCase()}.
        </p>
      </header>

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          Module setup
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Connect this page to the existing ${featureDisplay.toLowerCase()}
          backend integration before enabling data operations.
        </p>
      </section>
    </div>
  )
}
`
}

function createComponent() {
  return `interface ${featurePascal}OverviewProps {
  description?: string
}

export function ${featurePascal}Overview({
  description = 'Feature overview',
}: ${featurePascal}OverviewProps) {
  return (
    <section className="rounded-2xl border border-card-border bg-card p-5">
      <h2 className="text-lg font-semibold text-card-heading">
        ${featureDisplay}
      </h2>

      <p className="mt-2 text-sm text-card-text-muted">
        {description}
      </p>
    </section>
  )
}
`
}

function createHook() {
  return `/**
 * ${featureDisplay} feature hook.
 *
 * Add queries and mutations using the existing project data-fetching
 * conventions. No API calls are generated automatically.
 */

export function use${featurePascal}() {
  return {
    featureName: '${featureName}',
    isConfigured: false,
  }
}
`
}

function createApi() {
  return `/**
 * ${featureDisplay} API integration.
 *
 * Add endpoint functions here after reviewing the backend routes and
 * request/response contracts. No endpoint URLs have been assumed.
 */

export {}
`
}

function createService() {
  return `/**
 * ${featureDisplay} service layer.
 *
 * Add feature-specific business logic here.
 * Reuse existing API clients and error handling conventions.
 */

export {}
`
}

function createState() {
  return `/**
 * ${featureDisplay} state.
 *
 * Add local feature state only when needed.
 * Prefer existing application state patterns.
 */

export {}
`
}

function createUtils() {
  return `/**
 * ${featureDisplay} utilities.
 *
 * Add pure formatting, transformation, and validation helpers here.
 */

export {}
`
}

function createReadme() {
  return `# ${featureDisplay}

Generated feature module.

## Architecture

${selectedLayers.map((layer) => `- ${layer}/`).join('\n')}

## Integration checklist

- [ ] Review existing backend contracts.
- [ ] Connect API functions to the project's existing API client.
- [ ] Add request and response types.
- [ ] Implement hooks using existing data-fetching conventions.
- [ ] Add validation and error handling.
- [ ] Add permissions and authorization.
- [ ] Register the page in the appropriate router.
- [ ] Test existing and generated functionality.

## Generator safety

Existing files were preserved. No backend endpoints were invented.
`
}

const templates = {
  types: {
    [`types/${featureCamel}.types.ts`]: createTypes(),
  },
  pages: {
    [`pages/${featurePascal}Page.tsx`]: createPage(),
  },
  components: {
    [`components/${featurePascal}Overview.tsx`]: createComponent(),
  },
  hooks: {
    [`hooks/use${featurePascal}.ts`]: createHook(),
  },
  api: {
    [`api/${featureCamel}.api.ts`]: createApi(),
  },
  services: {
    [`services/${featureCamel}.service.ts`]: createService(),
  },
  state: {
    [`state/${featureCamel}.state.ts`]: createState(),
  },
  utils: {
    [`utils/${featureCamel}.ts`]: createUtils(),
  },
}

for (const layer of selectedLayers) {
  for (const [relativePath, content] of Object.entries(templates[layer])) {
    addFile(relativePath, content)
  }
}

addFile('README.md', createReadme())

const existingFeature = fs.existsSync(featureRoot)

console.log('\nIITNews Feature Generator')
console.log('=========================')
console.log(`Feature: ${featureDisplay}`)
console.log(`Target: ${toProjectRelative(featureRoot)}`)
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`)
console.log(`Feature exists: ${existingFeature ? 'Yes' : 'No'}`)
console.log(`Layers: ${selectedLayers.join(', ')}`)
console.log('')

let created = 0
let skipped = 0

for (const layer of selectedLayers) {
  const directory = path.join(featureRoot, layer)

  if (!fs.existsSync(directory)) {
    console.log(`[CREATE DIR] ${toProjectRelative(directory)}`)

    if (!dryRun) {
      fs.mkdirSync(directory, { recursive: true })
    }
  }
}

for (const [relativePath, content] of files) {
  const absolutePath = path.join(featureRoot, relativePath)
  const displayPath = toProjectRelative(absolutePath)

  try {
    const result = writeFileIfMissing(absolutePath, content, { dryRun })

    if (result.status === 'skipped') {
      console.log(`[SKIP] ${displayPath} (already exists)`)
      skipped += 1
    } else {
      console.log(`[${dryRun ? 'PREVIEW' : 'CREATE'}] ${displayPath}`)
      created += 1
    }
  } catch (error) {
    console.error(`[FAILED] ${displayPath}: ${error.message}`)
    process.exit(1)
  }
}

console.log('\nSummary')
console.log('-------')
console.log(`Files ${dryRun ? 'to create' : 'created'}: ${created}`)
console.log(`Existing files preserved: ${skipped}`)

if (dryRun) {
  console.log('\nNo files were written.')
} else {
  console.log('\nFeature generation complete.')
}
