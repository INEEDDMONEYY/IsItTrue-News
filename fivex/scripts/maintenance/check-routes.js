#!/usr/bin/env node

/**
 * IITNews Route Checker
 *
 * Read-only route and page-reference audit.
 *
 * Usage:
 * node scripts/maintenance/check-routes.js
 * node scripts/maintenance/check-routes.js --src-root=src
 * node scripts/maintenance/check-routes.js --json
 * node scripts/maintenance/check-routes.js --write-report
 */

import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT } from '../utils/file-system.js'

const args = process.argv.slice(2)

function getOption(name, fallback = '') {
  const item = args.find((arg) => arg.startsWith(`--${name}=`))
  return item ? item.slice(name.length + 3) : fallback
}

function hasFlag(flag) {
  return args.includes(flag)
}

if (hasFlag('--help')) {
  console.log(`
IITNews Route Checker

Options:
  --src-root=PATH       Source directory. Default: src
  --report=PATH         Markdown report path.
  --write-report        Write the report.
  --json                Print JSON output.
  --help                Show help.

This script does not modify source files or router configuration.
`)
  process.exit(0)
}

const srcRoot = path.resolve(PROJECT_ROOT, getOption('src-root', 'src'))
const reportPath = path.resolve(
  PROJECT_ROOT,
  getOption('report', 'reports/route-check.md'),
)

const ignoredDirectories = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.vite',
])

const sourceExtensions = new Set(['.tsx', '.ts', '.jsx', '.js'])

function walk(directory) {
  if (!fs.existsSync(directory)) return []

  const results = []

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        results.push(...walk(path.join(directory, entry.name)))
      }
      continue
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      results.push(path.join(directory, entry.name))
    }
  }

  return results
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8')
  } catch {
    return ''
  }
}

function normalizePath(value) {
  return value
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/'
}

function getRelative(filePath) {
  return path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/')
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

function extractRoutes(source, filePath) {
  const routes = []
  const patterns = [
    /\bpath\s*=\s*["'`]([^"'`]+)["'`]/g,
    /\bpath\s*:\s*["'`]([^"'`]+)["'`]/g,
  ]

  for (const pattern of patterns) {
    let match

    while ((match = pattern.exec(source)) !== null) {
      routes.push({
        path: normalizePath(match[1]),
        file: getRelative(filePath),
      })
    }
  }

  return routes
}

function extractLocalImports(source, filePath) {
  const imports = []
  const pattern =
    /import\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g

  let match

  while ((match = pattern.exec(source)) !== null) {
    const importPath = match[1]

    if (importPath.startsWith('.') || importPath.startsWith('@/')) {
      imports.push({
        importPath,
        file: filePath,
      })
    }
  }

  return imports
}

function resolveImport(importPath, importerPath) {
  const aliases = [
    {
      prefix: '@/',
      root: srcRoot,
    },
  ]

  let basePath

  if (importPath.startsWith('@/')) {
    const alias = aliases.find((item) =>
      importPath.startsWith(item.prefix),
    )

    if (!alias) return null

    basePath = path.join(alias.root, importPath.slice(2))
  } else {
    basePath = path.resolve(path.dirname(importerPath), importPath)
  }

  const candidates = [
    basePath,
    ...[...sourceExtensions].map((extension) => `${basePath}${extension}`),
    ...[...sourceExtensions].map((extension) =>
      path.join(basePath, `index${extension}`),
    ),
  ]

  return candidates.find((candidate) => fs.existsSync(candidate)) || null
}

if (!fs.existsSync(srcRoot)) {
  console.error(`Source directory not found: ${srcRoot}`)
  process.exit(1)
}

const files = walk(srcRoot)
const routeFiles = files.filter((file) => {
  const name = path.basename(file).toLowerCase()
  const source = readFile(file)

  return (
    name.includes('route') ||
    name.includes('router') ||
    /\b(createBrowserRouter|createHashRouter|Routes|Route)\b/.test(source)
  )
})

const routes = []
const unresolvedImports = []
const importedPageFiles = new Set()

for (const file of routeFiles) {
  const source = stripComments(readFile(file))

  routes.push(...extractRoutes(source, file))

  for (const item of extractLocalImports(source, file)) {
    const resolved = resolveImport(item.importPath, item.file)

    if (!resolved) {
      unresolvedImports.push({
        importer: getRelative(item.file),
        importPath: item.importPath,
      })
      continue
    }

    importedPageFiles.add(path.resolve(resolved))
  }
}

const routeCounts = new Map()

for (const route of routes) {
  const key = route.path

  if (!routeCounts.has(key)) {
    routeCounts.set(key, [])
  }

  routeCounts.get(key).push(route.file)
}

const duplicateRoutes = [...routeCounts.entries()]
  .filter(([, filesForRoute]) => filesForRoute.length > 1)
  .map(([routePath, filesForRoute]) => ({
    path: routePath,
    files: [...new Set(filesForRoute)],
  }))

const pageFiles = files.filter((file) =>
  /Page\.(tsx|jsx)$/.test(path.basename(file)),
)

const unreferencedPages = pageFiles
  .filter((file) => !importedPageFiles.has(path.resolve(file)))
  .map(getRelative)

const results = {
  scannedFiles: files.length,
  routeFiles: routeFiles.map(getRelative),
  routes,
  duplicateRoutes,
  unresolvedImports,
  unreferencedPages,
}

function createReport() {
  const lines = [
    '# IITNews Route Check',
    '',
    `- Source directory: \`${getRelative(srcRoot)}\``,
    `- Files scanned: ${results.scannedFiles}`,
    `- Route files: ${results.routeFiles.length}`,
    `- Route declarations found: ${routes.length}`,
    '',
    '## Duplicate route candidates',
    '',
  ]

  if (duplicateRoutes.length === 0) {
    lines.push('No duplicate route candidates detected.')
  } else {
    for (const item of duplicateRoutes) {
      lines.push(`- \`${item.path}\``)
      for (const file of item.files) lines.push(`  - ${file}`)
    }
  }

  lines.push('', '## Unresolved local imports', '')

  if (unresolvedImports.length === 0) {
    lines.push('No unresolved local imports detected in route files.')
  } else {
    for (const item of unresolvedImports) {
      lines.push(`- \`${item.importPath}\` in ${item.importer}`)
    }
  }

  lines.push('', '## Unreferenced page candidates', '')

  if (unreferencedPages.length === 0) {
    lines.push('No unreferenced page candidates detected.')
  } else {
    for (const file of unreferencedPages) lines.push(`- ${file}`)
  }

  lines.push(
    '',
    '> Note: This is a static heuristic. Dynamic routes, lazy imports,',
    '> barrel exports, route objects imported indirectly, and custom',
    '> aliases may require manual review.',
  )

  return lines.join('\n')
}

if (hasFlag('--json')) {
  console.log(JSON.stringify(results, null, 2))
} else {
  console.log('\nIITNews Route Check')
  console.log('===================')
  console.log(`Files scanned: ${results.scannedFiles}`)
  console.log(`Route files: ${results.routeFiles.length}`)
  console.log(`Routes found: ${routes.length}`)
  console.log(`Duplicate candidates: ${duplicateRoutes.length}`)
  console.log(`Unresolved imports: ${unresolvedImports.length}`)
  console.log(`Unreferenced page candidates: ${unreferencedPages.length}`)

  for (const item of duplicateRoutes) {
    console.log(`\n[DUPLICATE CANDIDATE] ${item.path}`)
    item.files.forEach((file) => console.log(`  - ${file}`))
  }

  for (const item of unresolvedImports) {
    console.log(
      `\n[UNRESOLVED IMPORT] ${item.importPath} in ${item.importer}`,
    )
  }

  for (const file of unreferencedPages) {
    console.log(`\n[UNREFERENCED PAGE CANDIDATE] ${file}`)
  }
}

if (hasFlag('--write-report')) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, createReport(), {
    encoding: 'utf8',
    flag: 'w',
  })

  console.log(`\nReport written: ${getRelative(reportPath)}`)
}
