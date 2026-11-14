
#!/usr/bin/env node

/**
 * IITNews Page Generator
 *
 * Examples:
 * node scripts/generators/generate-page.js --feature=case-files --name=CaseFiles --type=list
 * node scripts/generators/generate-page.js --feature=case-files --name=CaseFiles --type=create
 * node scripts/generators/generate-page.js --feature=case-files --name=CaseFiles --type=edit
 * node scripts/generators/generate-page.js --feature=case-files --name=CaseFiles --type=detail
 * node scripts/generators/generate-page.js --feature=case-files --name=EditorialPolicy --type=custom
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

const fs = require('node:fs')
const path = require('node:path')

const args = process.argv.slice(2)

const hasFlag = (flag) => args.includes(flag)

function getOption(name, fallback = '') {
  const argument = args.find((item) => item.startsWith(`--${name}=`))
  return argument ? argument.slice(name.length + 3) : fallback
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function toPascalCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

const featureInput = getOption('feature')
const nameInput = getOption('name')
const pageType = getOption('type', 'custom').toLowerCase()

const validTypes = ['list', 'create', 'edit', 'detail', 'custom']

if (hasFlag('--help')) {
  console.log(`
IITNews Page Generator

Usage:
  node scripts/generators/generate-page.js --feature=case-files --name=CaseFiles --type=list

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

const featureName = toKebabCase(featureInput)
const featureDisplay = toPascalCase(featureName)
const resourceName = toPascalCase(nameInput.replace(/Page$/i, ''))

if (!featureName || !resourceName) {
  console.error('Feature and page names must contain valid characters.')
  process.exit(1)
}

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
      return resourceName.endsWith('Page')
        ? resourceName
        : resourceName

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

const root = path.resolve(
  process.cwd(),
  getOption('root', 'src/features/admin'),
)

const featureRoot = path.join(root, featureName)
const pagesDirectory = path.join(featureRoot, 'pages')

const outputFile = path.join(
  pagesDirectory,
  `${exportName}.tsx`,
)

const relativeOutput = path.relative(process.cwd(), outputFile)
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

if (fs.existsSync(outputFile)) {
  console.log(`[SKIP] ${relativeOutput}`)
  console.log('Existing page preserved.')
  process.exit(0)
}

console.log(`[CREATE] ${relativeOutput}`)

if (dryRun) {
  console.log('\nPreview only. No files were written.')
  process.exit(0)
}

try {
  fs.mkdirSync(pagesDirectory, { recursive: true })

  fs.writeFileSync(outputFile, content, {
    encoding: 'utf8',
    flag: 'wx',
  })

  console.log('\nPage created successfully.')
  console.log(`Export: ${exportName}`)
} catch (error) {
  if (error.code === 'EEXIST') {
    console.log('\nExisting page detected. No changes made.')
  } else {
    console.error('\nPage generation failed:')
    console.error(error.message)
    process.exitCode = 1
  }
}
