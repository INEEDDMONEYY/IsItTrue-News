#!/usr/bin/env node

/**
 * IITNews Page Generator
 *
 * Examples:
 * node scripts/generators/frontend/generate-page.js --feature=case-files --name=CaseFiles --type=list
 * node scripts/generators/frontend/generate-page.js --feature=case-files --name=CaseFiles --type=create
 * node scripts/generators/frontend/generate-page.js --feature=case-files --name=CaseFiles --type=edit
 * node scripts/generators/frontend/generate-page.js --feature=case-files --name=CaseFiles --type=detail
 * node scripts/generators/frontend/generate-page.js --feature=case-files --name=EditorialPolicy --type=custom
 *
 * Options:
 * --feature=NAME
 * --name=NAME
 * --type=list|create|edit|detail|custom
 * --root=PATH
 * --dry-run
 *
 * Safety:
 * - Never overwrites existing pages.
 * - Does not modify routes.
 * - Does not invent API integrations.
 * - Does not assume a specific layout or permission system.
 */

import path from 'node:path'
import { getOption, hasFlag } from '../../utils/arguments.js'
import { PROJECT_ROOT, resolveSourceRoot, toProjectRelative, writeFileIfMissing } from '../../utils/file-system.js'
import { toPascalCase, validateFeatureName, validateName } from '../../utils/templates.js'

const featureInput = getOption('feature')
const nameInput = getOption('name')
const pageType = getOption('type', 'custom').toLowerCase()

const validTypes = ['list', 'create', 'edit', 'detail', 'custom']

if (hasFlag('--help')) {
  console.log(`
IITNews Page Generator

Usage:
  node scripts/generators/frontend/generate-page.js --feature=case-files --name=CaseFiles --type=list

Options:
  --feature=NAME    Required feature directory.
  --name=NAME       Required page/resource name.
  --type=TYPE       list, create, edit, detail, custom.
  --root=PATH       Feature root directory.
  --dry-run         Preview without writing.
  --help            Display help.

Examples:
  --name=CaseFiles --type=list
  --name=CaseFiles --type=create
  --name=CaseFiles --type=edit
  --name=CaseFiles --type=detail
  --name=EditorialPolicy --type=custom
`)
  process.exit(0)
}

if (!featureInput || !nameInput) {
  console.error('Both --feature and --name are required.')
  process.exit(1)
}

if (!validTypes.includes(pageType)) {
  console.error(`Invalid page type: ${pageType}`)
  console.error(`Valid types: ${validTypes.join(', ')}`)
  process.exit(1)
}

let featureName
let resourceName

try {
  featureName = validateFeatureName(featureInput)
  resourceName = validateName(nameInput.replace(/Page$/i, ''), 'name')
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

const featureDisplay = toPascalCase(featureName)

function getPageComponentName() {
  switch (pageType) {
    case 'create':
      return resourceName.startsWith('Create')
        ? resourceName
        : `Create${resourceName}`

    case 'edit':
      return resourceName.startsWith('Edit')
        ? resourceName
        : `Edit${resourceName}`

    case 'list':
      return resourceName

    case 'detail':
      return resourceName.endsWith('Detail')
        ? resourceName
        : `${resourceName}Detail`

    default:
      return resourceName
  }
}

const componentName = getPageComponentName()
const exportName = `${componentName}Page`

let root

try {
  root = resolveSourceRoot(getOption('root', 'src/features/admin'))
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

const featureRoot = path.join(root, featureName)
const pagesDirectory = path.join(featureRoot, 'pages')

const outputFile = path.join(
  pagesDirectory,
  `${exportName}.tsx`,
)

const relativeOutput = toProjectRelative(outputFile)
const dryRun = hasFlag('--dry-run')

const displayTitle = componentName
  .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
  .replace(/Page$/, '')

function createPageHeader() {
  return `
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-heading">
          ${displayTitle}
        </h1>

        <p className="text-sm text-text-muted">
          Manage ${displayTitle.toLowerCase()}.
        </p>
      </header>`
}

function createListPage() {
  return `/**
 * ${displayTitle}
 *
 * Connect this page to the feature's existing data hooks.
 * Add filters, pagination, and actions according to the
 * established conventions in this module.
 */

export function ${exportName}() {
  return (
    <div className="space-y-6">
      ${createPageHeader()}

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          ${displayTitle}
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Connect the existing feature data source to display records here.
        </p>
      </section>
    </div>
  )
}
`
}

function createCreatePage() {
  return `/**
 * ${displayTitle}
 *
 * Add the feature's existing form components, validation,
 * mutation hooks, and navigation behavior here.
 */

export function ${exportName}() {
  return (
    <div className="space-y-6">
      ${createPageHeader()}

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          Create ${resourceName.replace(/^Create/, '')}
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Add the appropriate form fields and connect them to the
          existing create operation for this feature.
        </p>
      </section>
    </div>
  )
}
`
}

function createEditPage() {
  return `/**
 * ${displayTitle}
 *
 * Load the existing record using the module's established hooks.
 * Add form validation and update mutation behavior.
 */

export function ${exportName}() {
  return (
    <div className="space-y-6">
      ${createPageHeader()}

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          Edit ${resourceName.replace(/^Edit/, '')}
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Load the selected record and connect the existing update operation.
        </p>
      </section>
    </div>
  )
}
`
}

function createDetailPage() {
  return `/**
 * ${displayTitle}
 *
 * Load and display an individual record.
 * Reuse existing detail components and data hooks where available.
 */

export function ${exportName}() {
  return (
    <div className="space-y-6">
      ${createPageHeader()}

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <h2 className="text-lg font-semibold text-card-heading">
          Record Details
        </h2>

        <p className="mt-2 text-sm text-card-text-muted">
          Connect the record identifier, existing detail hook,
          and feature components.
        </p>
      </section>
    </div>
  )
}
`
}

function createCustomPage() {
  return `/**
 * ${displayTitle}
 *
 * Custom page scaffold for the ${featureDisplay} feature.
 * Add the required components and existing feature integrations.
 */

export function ${exportName}() {
  return (
    <div className="space-y-6">
      ${createPageHeader()}

      <section className="rounded-2xl border border-card-border bg-card p-5">
        <p className="text-sm text-card-text-muted">
          Add your page content here.
        </p>
      </section>
    </div>
  )
}
`
}

const templates = {
  list: createListPage,
  create: createCreatePage,
  edit: createEditPage,
  detail: createDetailPage,
  custom: createCustomPage,
}

const content = templates[pageType]()

console.log('\nIITNews Page Generator')
console.log('======================')
console.log(`Feature: ${featureDisplay}`)
console.log(`Page: ${exportName}`)
console.log(`Type: ${pageType}`)
console.log(`Output: ${relativeOutput}`)
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`)
console.log('')

let writeResult

try {
  writeResult = writeFileIfMissing(outputFile, content, { dryRun })
} catch (error) {
  console.error('\nPage generation failed:')
  console.error(error.message)
  process.exit(1)
}

if (writeResult.status === 'skipped') {
  console.log(`[SKIP] ${relativeOutput}`)
  console.log('Existing page preserved. No changes made.')
  process.exit(0)
}

console.log(`[CREATE] ${relativeOutput}`)

if (dryRun) {
  console.log('\nPreview only. No files were written.')
} else {
  console.log('\nPage created successfully.')
  console.log(`Export: ${exportName}`)
}

printRouteGuidance()

function printRouteGuidance() {
  const importPath = path
    .relative(path.join(PROJECT_ROOT, 'src'), outputFile)
    .split(path.sep)
    .join('/')
    .replace(/\.tsx$/, '')

  console.log('\nRoute registration is not automatic. Add:')
  console.log(`  import { ${exportName} } from '@/${importPath}'`)
  console.log(`  { path: '<route-path>', element: <${exportName} /> }`)
  console.log('to the matching children in src/app/routes/index.tsx.')
}
