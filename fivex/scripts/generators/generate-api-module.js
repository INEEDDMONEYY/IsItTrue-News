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

import fs from 'node:fs'
import path from 'node:path'
import { getOption, hasFlag } from '../utils/arguments.js'
import { PROJECT_ROOT, resolveSourceRoot, toProjectRelative, writeFileIfMissing } from '../utils/file-system.js'
import { escapeComment, isValidIdentifier, toCamelCase, toKebabCase, toPascalCase, validateApiPath, validateFeatureName } from '../utils/templates.js'


const RESERVED_WORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default',
  'delete', 'do', 'else', 'enum', 'export', 'extends', 'false', 'finally', 'for',
  'function', 'if', 'import', 'in', 'instanceof', 'new', 'null', 'return', 'super',
  'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with',
  'yield', 'let', 'static', 'await', 'implements', 'interface', 'package', 'private',
  'protected', 'public',
])

function isSafeIdentifier(value) {
  return isValidIdentifier(value) && !RESERVED_WORDS.has(value)
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
  - API operations (paths under /api/, {param} for path arguments)
  - HTTP method and route documentation
  - Request and response types

Generated operations are exported as an object namespace (for example
advertiserPricingApi.getAdvertiserPricing), call the shared apiClient from
@/api/client, and return the unwrapped response data. Existing files are
never overwritten.
`)
  process.exit(0)
}

const featureInput = getOption('feature')
const contractInput = getOption('contract')

if (!featureInput || !contractInput) {
  console.error('Both --feature and --contract are required.')
  process.exit(1)
}

let featureName

try {
  featureName = validateFeatureName(featureInput)
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

const contractPath = path.resolve(PROJECT_ROOT, contractInput)

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

let root

try {
  root = resolveSourceRoot(getOption('root', 'src/features/admin'))
} catch (error) {
  console.error(error.message)
  process.exit(1)
}

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
    if (!isSafeIdentifier(operation.name || '')) {
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

    try {
      validateApiPath(operation.path)
    } catch (error) {
      throw new Error(`Operation "${operation.name}": ${error.message}`)
    }

    const pathParams = [...operation.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1])

    if (new Set(pathParams).size !== pathParams.length) {
      throw new Error(`Operation "${operation.name}" repeats a path parameter.`)
    }

    if (pathParams.some((param) => !isSafeIdentifier(param))) {
      throw new Error(`Operation "${operation.name}" has an invalid path parameter name.`)
    }

    if (operation.requestType && pathParams.includes('input')) {
      throw new Error(`Operation "${operation.name}" cannot use a path parameter named "input".`)
    }

    if (
      operation.requestType &&
      !typeNames.has(operation.requestType.replace(/\[\]$/, ''))
    ) {
      throw new Error(
        `Unknown request type "${operation.requestType}" in "${operation.name}".`,
      )
    }

    if (
      operation.responseType &&
      !typeNames.has(operation.responseType.replace(/\[\]$/, ''))
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
    if (operation.requestType) imports.add(operation.requestType.replace(/\[\]$/, ''))
    if (operation.responseType) imports.add(operation.responseType.replace(/\[\]$/, ''))
  }

  const importStatement = imports.size
    ? `import type { ${[...imports].sort().join(', ')} } from '../types/${toKebabCase(resourceName)}.types'\n`
    : ''

  const functions = contract.operations.map((operation) => {
    const responseType = operation.responseType || 'void'
    const method = operation.method.toUpperCase()
    const pathParams = [...operation.path.matchAll(/\{([^}]+)\}/g)].map((match) => match[1])

    const paramList = pathParams.map((param) => `${param}: string`)

    if (operation.requestType) {
      paramList.push(`input: ${operation.requestType}`)
    }

    const urlExpression = pathParams.length
      ? '`' +
        operation.path.replace(
          /\{([^}]+)\}/g,
          (_, param) => `\${encodeURIComponent(${param})}`,
        ) +
        '`'
      : `'${operation.path}'`

    let requestArgs = ''

    if (operation.requestType) {
      if (method === 'GET') requestArgs = ', { params: input }'
      else if (method === 'DELETE') requestArgs = ', { data: input }'
      else requestArgs = ', input'
    }

    const description = operation.description
      ? ` * ${escapeComment(operation.description)}\n`
      : ''

    return `  /**
   * ${escapeComment(operation.name)}
${description}   * HTTP: ${method} ${operation.path}
   */
  ${operation.name}: async (${paramList.join(', ')}): Promise<${responseType}> => {
    const { data } = await apiClient.${method.toLowerCase()}<${responseType}>(${urlExpression}${requestArgs})

    return data
  },`
  })

  const namespaceName = `${toCamelCase(resourceName)}Api`

  return `/**
 * ${resourceName} API module.
 *
 * Generated from: ${path.basename(contractInput)}
 *
 * Uses the shared apiClient, which sends credentials with each request.
 * Verify the paths and types against the backend before production use.
 */
import { apiClient } from '@/api/client'
${importStatement}
export const ${namespaceName} = {
${functions.join('\n\n')}
}
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
console.log(`Contract: ${toProjectRelative(contractPath)}`)
console.log(`Operations: ${contract.operations.length}`)
console.log(`Types: ${contract.types.length}`)
console.log(`Mode: ${dryRun ? 'DRY RUN' : 'WRITE'}`)
console.log('')

let created = 0
let skipped = 0

for (const file of outputFiles) {
  const relativePath = toProjectRelative(file.path)

  try {
    const result = writeFileIfMissing(file.path, file.content, { dryRun })

    if (result.status === 'skipped') {
      console.log(`[SKIP] ${relativePath} (already exists)`)
      skipped += 1
    } else {
      console.log(`[${dryRun ? 'PREVIEW' : 'CREATE'}] ${relativePath}`)
      created += 1
    }
  } catch (error) {
    console.error(`[FAILED] ${relativePath}: ${error.message}`)
    process.exit(1)
  }
}

console.log('\nSummary')
console.log('-------')
console.log(`Files ${dryRun ? 'to create' : 'created'}: ${created}`)
console.log(`Existing files preserved: ${skipped}`)

if (dryRun) {
  console.log('\nDry run complete. No files were written.')
} else {
  console.log('\nAPI module generated and connected to apiClient.')
  console.log('Review the generated types against the backend contract.')
}

