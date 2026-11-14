
#!/usr/bin/env node

const path = require('node:path')

const {
  args,
  getOption,
  hasFlag,
  printHelp,
} = require('../utils/arguments')

const { log, createSummary } = require('../utils/logger')

const {
  listFiles,
} = require('../utils/file-system')

const EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.json',
  '.css',
  '.scss',
  '.svg',
]

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

if (hasFlag('--help')) {
  printHelp('IITNews Import Checker', [
    'Options:',
    '  --src-root=PATH       Source directory. Default: src',
    '  --alias=PREFIX        Alias prefix. Default: @/',
    '  --alias-root=PATH     Alias target. Default: src',
    '  --json                Print JSON output.',
    '  --write-report        Write a Markdown report.',
    '  --report=PATH         Report path.',
    '  --help                Show help.',
  ])

  process.exit(0)
}

const projectRoot = process.cwd()

const srcRoot = path.resolve(
  projectRoot,
  getOption('src-root', 'src'),
)

const aliasPrefix = getOption('alias', '@/').replace(/\/?$/, '/')

const aliasRoot = path.resolve(
  projectRoot,
  getOption('alias-root', path.relative(projectRoot, srcRoot)),
)

const reportPath = path.resolve(
  projectRoot,
  getOption('report', 'reports/import-check.md'),
)

const summary = createSummary()

function relative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/')
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

function extractImports(source) {
  const references = []

  const patterns = [
    /\bimport\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ]

  for (const pattern of patterns) {
    let match

    while ((match = pattern.exec(source)) !== null) {
      references.push(match[1])
    }
  }

  return [...new Set(references)]
}

function resolveImport(reference, importer) {
  if (
    reference.startsWith('http://') ||
    reference.startsWith('https://') ||
    reference.startsWith('data:')
  ) {
    return { external: true }
  }

  if (
    !reference.startsWith('.') &&
    !reference.startsWith(aliasPrefix)
  ) {
    return { external: true }
  }

  let basePath

  if (reference.startsWith(aliasPrefix)) {
    basePath = path.resolve(
      aliasRoot,
      reference.slice(aliasPrefix.length),
    )
  } else {
    basePath = path.resolve(
      path.dirname(importer),
      reference,
    )
  }

  const candidates = [
    basePath,
    ...EXTENSIONS.map((extension) => `${basePath}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) =>
      path.join(basePath, `index${extension}`),
    ),
  ]

  const resolved = candidates.find((candidate) => {
    try {
      return require('node:fs').statSync(candidate).isFile()
    } catch {
      return false
    }
  })

  return resolved
    ? { external: false, resolved }
    : { external: false, resolved: null }
}

function createReport(results) {
  const lines = [
    '# IITNews Import Check',
    '',
    `- Source files scanned: ${results.sourceFilesScanned}`,
    `- Local imports checked: ${results.localImportsChecked}`,
    `- Missing imports: ${results.missingImports.length}`,
    '',
    '## Missing local imports',
    '',
  ]

  if (results.missingImports.length === 0) {
    lines.push('No missing local imports detected.')
  } else {
    for (const item of results.missingImports) {
      lines.push(`- \`${item.reference}\` from ${item.importer}`)
    }
  }

  lines.push(
    '',
    '> This is a static import check. It does not fully resolve',
    '> TypeScript path mappings, package exports, or runtime modules.',
  )

  return lines.join('\n')
}

function main() {
  const fs = require('node:fs')

  if (!fs.existsSync(srcRoot)) {
    throw new Error(`Source directory not found: ${srcRoot}`)
  }

  const files = listFiles(srcRoot, {
    extensions: SOURCE_EXTENSIONS,
  })

  const missingImports = []
  let localImportsChecked = 0

  for (const file of files) {
    summary.increment('inspected')

    const source = stripComments(fs.readFileSync(file, 'utf8'))
    const references = extractImports(source)

    for (const reference of references) {
      const resolution = resolveImport(reference, file)

      if (resolution.external) continue

      localImportsChecked += 1

      if (!resolution.resolved) {
        missingImports.push({
          importer: relative(file),
          reference,
        })
      }
    }
  }

  const results = {
    sourceFilesScanned: files.length,
    localImportsChecked,
    missingImports,
  }

  if (hasFlag('--json')) {
    console.log(JSON.stringify(results, null, 2))
  } else {
    log('info', 'IITNews Import Check')
    log('detail', `Source files scanned: ${files.length}`)
    log('detail', `Local imports checked: ${localImportsChecked}`)
    log(
      missingImports.length ? 'warning' : 'success',
      `Missing imports: ${missingImports.length}`,
    )

    for (const item of missingImports) {
      console.log(`\n[MISSING] ${item.reference}`)
      console.log(`  Imported by: ${item.importer}`)
    }
  }

  if (hasFlag('--write-report')) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(reportPath, createReport(results), 'utf8')

    log('success', `Report written: ${relative(reportPath)}`)
  }

  summary.print()

  return missingImports.length
}

try {
  const missingCount = main()

  if (missingCount > 0) {
    process.exitCode = 1
  }
} catch (error) {
  log('error', error.message)
  process.exitCode = 1
}
