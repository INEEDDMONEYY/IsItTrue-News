#!/usr/bin/env node

import path from 'node:path'
import { getOption, hasFlag } from '../../utils/arguments.js'
import { resolveSourceRoot, toProjectRelative, writeFileIfMissing } from '../../utils/file-system.js'
import { isValidIdentifier, validateFeatureName, validateName } from '../../utils/templates.js'

/**
 * IITNews Component Generator
 *
 * Examples:
 * node scripts/generators/frontend/generate-component.js --feature=articles --name=ArticleCard --type=card
 * node scripts/generators/frontend/generate-component.js --feature=articles --name=ArticleFilters --type=filters
 * node scripts/generators/frontend/generate-component.js --feature=articles --name=ArticleForm --type=form
 * node scripts/generators/frontend/generate-component.js --feature=articles --name=ArticleTable --type=table
 * node scripts/generators/frontend/generate-component.js --feature=articles --name=ArticleSection --type=section
 * node scripts/generators/frontend/generate-component.js --feature=articles --name=ArticleDialog --type=modal
 *
 * Options:
 * --feature=NAME
 * --name=NAME
 * --type=TYPE
 * --directory=PATH
 * --root=PATH
 * --props=NAME:TYPE,NAME:TYPE
 * --dry-run
 *
 * Safety:
 * - Never overwrites existing files.
 * - Does not modify existing components.
 * - Does not invent API integrations.
 * - Generates typed React components.
 */

const featureInput = getOption('feature')
const nameInput = getOption('name')
const componentType = getOption('type', 'custom').toLowerCase()

const validTypes = [
  'custom',
  'card',
  'section',
  'form',
  'filters',
  'table',
  'modal',
  'empty-state',
  'loader',
]

if (hasFlag('--help')) {
  console.log(`
IITNews Component Generator

Usage:
  node scripts/generators/frontend/generate-component.js --feature=articles --name=ArticleCard --type=card

Options:
  --feature=NAME       Required feature directory.
  --name=NAME          Required component name.
  --type=TYPE          Component template.
  --directory=PATH     Custom component subdirectory.
  --root=PATH          Feature root directory.
  --props=LIST         Optional typed props.
  --dry-run            Preview without writing.
  --help               Show this help.

Types:
  ${validTypes.join(', ')}

Custom props example:
  --props=title:string,description:string,compact:boolean
`)
  process.exit(0)
}

if (!featureInput || !nameInput) {
  console.error('Both --feature and --name are required.')
  process.exit(1)
}

if (!validTypes.includes(componentType)) {
  console.error(`Invalid component type: ${componentType}`)
  console.error(`Valid types: ${validTypes.join(', ')}`)
  process.exit(1)
}

let featureName
let componentName
let root

try {
  featureName = validateFeatureName(featureInput)
  componentName = validateName(nameInput, 'name')
  root = resolveSourceRoot(getOption('root', 'src/features/admin'))
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

const featureRoot = path.join(root, featureName)

const customDirectory = getOption('directory', 'components')
const directorySegments = customDirectory
  .replace(/\\/g, '/')
  .split('/')
  .filter(Boolean)

if (
  path.isAbsolute(customDirectory) ||
  directorySegments.some((segment) => segment === '..' || segment === '.')
) {
  console.error('--directory must be a safe relative path.')
  process.exit(1)
}

const outputDirectory = path.resolve(featureRoot, ...directorySegments)

if (
  outputDirectory !== featureRoot &&
  !outputDirectory.startsWith(featureRoot + path.sep)
) {
  console.error('Output directory must remain inside the feature directory.')
  process.exit(1)
}

const dryRun = hasFlag('--dry-run')
const propsInput = getOption('props')

function parseProps(input) {
  if (!input) return []

  return input.split(',').map((entry) => {
    const [name, type] = entry.split(':').map((part) => part.trim())

    const allowedTypes = [
      'string',
      'number',
      'boolean',
      'ReactNode',
      'string[]',
      'number[]',
    ]

    if (!name || !isValidIdentifier(name)) {
      throw new Error(`Invalid prop name: ${name}`)
    }

    if (!allowedTypes.includes(type)) {
      throw new Error(
        `Invalid prop type for "${name}". Allowed: ${allowedTypes.join(', ')}`,
      )
    }

    return { name, type }
  })
}

let props

try {
  props = parseProps(propsInput)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

function createPropsInterface() {
  if (props.length === 0) return ''

  const needsReactNode = props.some((prop) => prop.type === 'ReactNode')

  const importStatement = needsReactNode
    ? "import type { ReactNode } from 'react'\n\n"
    : ''

  return `${importStatement}interface ${componentName}Props {
${props.map((prop) => `  ${prop.name}${prop.type === 'boolean' ? '?' : ''}: ${prop.type}`).join('\n')}
}

`
}

function createCustomTemplate() {
  const propsDestructure = props.length
    ? `{
  ${props.map((prop) => prop.name).join(',\n  ')},
}: ${componentName}Props`
    : ''

  const body = props.length
    ? props
        .map((prop) => {
          if (prop.type === 'ReactNode') {
            return `      {${prop.name} && <div>{${prop.name}}</div>}`
          }

          return `      <span className="text-sm text-card-text-muted">{String(${prop.name})}</span>`
        })
        .join('\n')
    : '      Add your component content here.'

  return `/**
 * ${componentName}
 * Generated reusable component.
 */

${createPropsInterface()}export function ${componentName}(${propsDestructure}) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-4">
${body}
    </div>
  )
}
`
}

function createCardTemplate() {
  return `/**
 * ${componentName}
 * Reusable card component.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <article className="rounded-2xl border border-card-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-card-heading">
          ${props.some((prop) => prop.name === 'title') ? '{props.title}' : 'Card Title'}
        </h3>

        <p className="text-sm text-card-text-muted">
          ${props.some((prop) => prop.name === 'description') ? '{props.description}' : 'Card description goes here.'}
        </p>
      </div>
    </article>
  )
}
`
}

function createSectionTemplate() {
  return `/**
 * ${componentName}
 * Reusable content section.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <section className="space-y-5">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-heading">
          ${props.some((prop) => prop.name === 'title') ? '{props.title}' : 'Section Title'}
        </h2>

        <p className="text-sm text-text-muted">
          ${props.some((prop) => prop.name === 'description') ? '{props.description}' : 'Section description.'}
        </p>
      </header>

      <div>
        Add section content here.
      </div>
    </section>
  )
}
`
}

function createFormTemplate() {
  return `/**
 * ${componentName}
 * Form component scaffold.
 *
 * Add field validation and connect the existing mutation hook.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault()
        // Connect the existing submit handler.
      }}
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-heading" htmlFor="example-field">
          Example Field
        </label>

        <input
          id="example-field"
          type="text"
          placeholder="Enter a value"
          className="w-full rounded-xl border border-card-border bg-card px-4 py-3 text-sm text-heading outline-none transition focus:border-neutral-500"
        />
      </div>

      <button
        type="submit"
        className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98]"
      >
        Save
      </button>
    </form>
  )
}
`
}

function createFiltersTemplate() {
  return `/**
 * ${componentName}
 * Search and filtering component scaffold.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="search"
        placeholder="Search..."
        aria-label="Search"
        className="min-w-0 flex-1 rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-heading outline-none transition focus:border-neutral-500"
      />

      <select
        aria-label="Filter results"
        defaultValue="all"
        className="rounded-xl border border-card-border bg-card px-4 py-2.5 text-sm text-heading outline-none"
      >
        <option value="all">All</option>
      </select>
    </div>
  )
}
`
}

function createTableTemplate() {
  return `/**
 * ${componentName}
 * Responsive table scaffold.
 *
 * Add typed row data and existing feature integrations.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-card-border">
      <table className="w-full min-w-[600px] text-left text-sm">
        <thead className="bg-card-2 text-card-text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t border-card-border">
            <td colSpan={3} className="px-4 py-8 text-center text-card-text-muted">
              No data connected yet.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
`
}

function createModalTemplate() {
  return `/**
 * ${componentName}
 * Accessible modal presentation scaffold.
 *
 * Control visibility from the parent component.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="${componentName}-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card p-6 shadow-xl">
        <h2
          id="${componentName}-title"
          className="text-lg font-semibold text-card-heading"
        >
          Dialog Title
        </h2>

        <div className="mt-4 text-sm text-card-text-muted">
          Add dialog content here.
        </div>
      </div>
    </div>
  )
}
`
}

function createEmptyStateTemplate() {
  return `/**
 * ${componentName}
 * Empty state component.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-card-border px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card-2">
        <span className="text-xl text-card-text-muted">—</span>
      </div>

      <h3 className="text-base font-semibold text-card-heading">
        No results found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-card-text-muted">
        There is currently nothing to display here.
      </p>
    </div>
  )
}
`
}

function createLoaderTemplate() {
  return `/**
 * ${componentName}
 * Loading state component.
 */

${createPropsInterface()}export function ${componentName}(${props.length ? `props: ${componentName}Props` : ''}) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="space-y-4 animate-pulse"
    >
      <div className="h-6 w-1/3 rounded-lg bg-card-2" />
      <div className="h-4 w-full rounded-lg bg-card-2" />
      <div className="h-4 w-4/5 rounded-lg bg-card-2" />
      <div className="h-24 rounded-xl bg-card-2" />
    </div>
  )
}
`
}

const templates = {
  custom: createCustomTemplate,
  card: createCardTemplate,
  section: createSectionTemplate,
  form: createFormTemplate,
  filters: createFiltersTemplate,
  table: createTableTemplate,
  modal: createModalTemplate,
  'empty-state': createEmptyStateTemplate,
  loader: createLoaderTemplate,
}

const outputFile = path.join(
  outputDirectory,
  `${componentName}.tsx`,
)

console.log('\nIITNews Component Generator')
console.log('===========================')
console.log(`Feature: ${featureName}`)
console.log(`Component: ${componentName}`)
console.log(`Type: ${componentType}`)
console.log(`Directory: ${toProjectRelative(outputDirectory)}`)
console.log(`Output: ${toProjectRelative(outputFile)}`)
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`)
console.log('')

let writeResult

try {
  writeResult = writeFileIfMissing(outputFile, templates[componentType](), { dryRun })
} catch (error) {
  console.error('\nComponent generation failed:')
  console.error(error.message)
  process.exit(1)
}

if (writeResult.status === 'skipped') {
  console.log('[SKIP] Existing component preserved. No changes made.')
  process.exit(0)
}

console.log(`[CREATE] ${toProjectRelative(outputFile)}`)

if (dryRun) {
  console.log('\nPreview complete. No files were written.')
} else {
  console.log('\nComponent created successfully.')
}
