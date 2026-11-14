
#!/usr/bin/env node

/**
 * IITNews API Module Generator
 *
 * Usage:
 * node scripts/generators/generate-api-module.js \
 *   --feature=advertising \
 *   --contract=scripts/contracts/advertising.contract.json
 *
 * Options:
 * --feature=NAME
 * --contract=PATH
 * --root=PATH
 * --dry-run
 *
 * Safety:
 * - Requires an explicit API contract.
 * - Never overwrites existing files.
 * - Does not invent API endpoints.
 * - Does not assume an HTTP client.
 * - Does not modify existing hooks or services.
 * - Does not implement authentication or request handling.
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

function isValidIdentifier(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
}

if (hasFlag('--help')) {
  console.log(`
IITNews API Module Generator

Usage:
  node scripts/generators/generate-api-module.js --feature=advertising --contract=scripts/contracts/advertising.contract.json

Options:
  --feature=NAME       Required feature directory.
  --contract=PATH      Required JSON API contract.
  --root=PATH          Feature root directory.
  --dry-run            Preview without writing.
  --help               Display help.

The contract defines:
  - Resource name
  - TypeScript data types
  - API operations
  - HTTP method and route documentation
  - Request and response types

The generator does not implement HTTP requests.
`)
  process.exit(0)
}

const featureInput = getOption('feature')
const contractInput = getOption('contract')

if (!featureInput || !contractInput) {
  console.error('Both --feature and --contract are required.')
  process.exit(1)
}

const featureName = toKebabCase(featureInput)

if (!featureName) {
  console.error('Invalid feature name.')
  process.exit(1)
}

const contractPath = path.resolve(process.cwd(), contractInput)

if (!fs.existsSync(contractPath)) {
  console.error(`Contract file not found: ${contractInput}`)
  process.exit(1)
}

let contract

try {
  contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'))
} catch (error) {
  console.error(`Unable to read contract JSON: ${error.message}`)
  process.exit(1)
}

const resourceName = toPascalCase(contract.resource || '')

if (!isValidIdentifier(resourceName)) {
  console.error('Contract must provide a valid resource name.')
  process.exit(1)
}

const root = path.resolve(
  process.cwd(),
  getOption('root', 'src/features/admin'),
)

const featureRoot = path.join(root, featureName)

const dryRun = hasFlag('--dry-run')

function validateType(type, label) {
  if (typeof type !== 'string' || !type.trim()) {
    throw new Error(`${label} must be a non-empty TypeScript type.`)
  }

  // Restrict contract types to common TypeScript type syntax.
  // This is not a full TypeScript parser.
  const safeTypePattern = /^[A-Za-z0-9_$<>, |[\].'"():;&?]+$/

  if (!safeTypePattern.test(type)) {
    throw new Error(`Unsupported type syntax for ${label}: ${type}`)
  }

  return type.trim()
}

function validateContract() {
  if (!Array.isArray(contract.types)) {
    throw new Error('Contract must include a types array.')
  }

  if (!Array.isArray(contract.operations)) {
    throw new Error('Contract must include an operations array.')
  }

  const typeNames = new Set()

  for (const definition of contract.types) {
    if (!isValidIdentifier(definition.name || '')) {
      throw new Error(`Invalid type name: ${definition.name}`)
    }

    if (typeNames.has(definition.name)) {
      throw new Error(`Duplicate type definition: ${definition.name}`)
    }

    typeNames.add(definition.name)

    if (!Array.isArray(definition.fields)) {
      throw new Error(`Type "${definition.name}" must have a fields array.`)
    }

    const fieldNames = new Set()

    for (const field of definition.fields) {
      if (!isValidIdentifier(field.name || '')) {
        throw new Error(
          `Invalid field name in "${definition.name}": ${field.name}`,
        )
      }

      if (fieldNames.has(field.name)) {
        throw new Error(
          `Duplicate field "${field.name}" in "${definition.name}".`,
        )
      }

      fieldNames.add(field.name)
      validateType(field.type, `${definition.name}.${field.name}`)
    }
  }

  const operationNames = new Set()

  for (const operation of contract.operations) {
    if (!isValidIdentifier(operation.name || '')) {
      throw new Error(`Invalid operation name: ${operation.name}`)
    }

    if (operationNames.has(operation.name)) {
      throw new Error(`Duplicate operation: ${operation.name}`)
    }

    operationNames.add(operation.name)

    const method = String(operation.method || '').toUpperCase()

    if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      throw new Error(
        `Invalid HTTP method for "${operation.name}".`,
      )
    }

    if (
      typeof operation.path !== 'string' ||
      !operation.path.startsWith('/')
    ) {
      throw new Error(
        `Operation "${operation.name}" must have a path starting with "/".`,
      )
    }

    if (
      operation.requestType &&
      !typeNames.has(operation.requestType)
    ) {
      throw new Error(
        `Unknown request type "${operation.requestType}" in "${operation.name}".`,
      )
    }

    if (
      operation.responseType &&
      !typeNames.has(operation.responseType)
    ) {
      throw new Error(
        `Unknown response type "${operation.responseType}" in "${operation.name}".`,
      )
    }
  }
}

try {
  validateContract()
} catch (error) {
  console.error(`\nInvalid API contract: ${error.message}`)
  process.exit(1)
}

const typeFileName = `${toKebabCase(resourceName)}.types.ts`
const apiFileName = `${toKebabCase(resourceName)}.api.ts`

function createTypesSource() {
  const definitions = contract.types.map((definition) => {
    const fields = definition.fields
      .map((field) => {
        const optional = field.optional ? '?' : ''
        const comment = field.description
          ? `  /** ${field.description.replace(/\*\//g, '* /')} */\n`
          : ''

        return `${comment}  ${field.name}${optional}: ${field.type}`
      })
      .join('\n')

    return `export interface ${definition.name} {\n${fields}\n}`
  })

  return `/**
 * ${resourceName} API types.
 *
 * Generated from: ${path.basename(contractInput)}
 *
 * Review these definitions against the actual backend response
 * and request contracts before using them in production.
 */

${definitions.join('\n\n')}
`
}

function createApiSource() {
  const imports = new Set()

  for (const operation of contract.operations) {
    if (operation.requestType) imports.add(operation.requestType)
    if (operation.responseType) imports.add(operation.responseType)
  }

  const importStatement = imports.size
    ? `import type { ${[...imports].sort().join(', ')} } from '../types/${toKebabCase(resourceName)}.types'\n\n`
    : ''

  const functions = contract.operations.map((operation) => {
    const requestType = operation.requestType
    const responseType = operation.responseType || 'void'
    const method = operation.method.toUpperCase()

    const params = requestType ? `input: ${requestType}` : ''
    const returnType = `Promise<${responseType}>`

    const description = operation.description
      ? ` * ${operation.description}\n`
      : ''

    return `/**
 * ${operation.name}
${description} * HTTP: ${method} ${operation.path}
 *
 * TODO:
 * 1. Connect to the existing IITNews API client.
 * 2. Implement request and response handling.
 * 3. Apply the project's existing authentication behavior.
 * 4. Reuse established error handling.
 * 5. Verify the response against the backend contract.
 */
export async function ${operation.name}(${params}): ${returnType} {
  void ${requestType ? 'input' : '0'}

  throw new Error(
    '${operation.name} has not been connected to the IITNews API client.',
  )
}`
  })

  return `/**
 * ${resourceName} API module.
 *
 * Generated from: ${path.basename(contractInput)}
 *
 * IMPORTANT:
 * These are typed API operation scaffolds, not working HTTP requests.
 * No API client, authentication behavior, or endpoint implementation
 * has been assumed.
 */

${importStatement}${functions.join('\n\n')}
`
}

const outputFiles = [
  {
    path: path.join(featureRoot, 'types', typeFileName),
    content: createTypesSource(),
  },
  {
    path: path.join(featureRoot, 'api', apiFileName),
    content: createApiSource(),
  },
]

console.log('\nIITNews API Module Generator')
console.log('===========================')
console.log(`Feature: ${featureName}`)
console.log(`Resource: ${resourceName}`)
console.log(`Contract: ${path.relative(process.cwd(), contractPath)}`)
console.log(`Operations: ${contract.operations.length}`)
console.log(`Types: ${contract.types.length}`)
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`)
console.log('')

let created = 0
let skipped = 0

for (const file of outputFiles) {
  const relativePath = path.relative(process.cwd(), file.path)

  if (fs.existsSync(file.path)) {
    console.log(`[SKIP] ${relativePath}`)
    skipped += 1
    continue
  }

  console.log(`[CREATE] ${relativePath}`)

  if (!dryRun) {
    fs.mkdirSync(path.dirname(file.path), { recursive: true })

    try {
      fs.writeFileSync(file.path, file.content, {
        encoding: 'utf8',
        flag: 'wx',
      })

      created += 1
    } catch (error) {
      if (error.code === 'EEXIST') {
        console.log(`[SKIP] ${relativePath} (already exists)`)
        skipped += 1
      } else {
        throw error
      }
    }
  } else {
    created += 1
  }
}

console.log('\nSummary')
console.log('-------')
console.log(`Files ${dryRun ? 'to create' : 'created'}: ${created}`)
console.log(`Existing files preserved: ${skipped}`)

if (dryRun) {
  console.log('\nDry run complete. No files were written.')
} else {
  console.log('\nAPI scaffolding generated.')
  console.log('Connect the generated functions to your existing API client.')
}
