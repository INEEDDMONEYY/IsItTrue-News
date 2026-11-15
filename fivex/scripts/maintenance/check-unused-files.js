#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

import {
  getOption,
  hasFlag,
  printHelp,
} from '../utils/arguments.js'

import { log } from '../utils/logger.js'
import { listFiles, PROJECT_ROOT } from '../utils/file-system.js'

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx']

const IGNORED_FILE_NAMES = new Set([
  'App.tsx',
  'App.ts',
  'main.tsx',
  'main.ts',
  'index.tsx',
  'index.ts',
  'vite-env.d.ts',
])

const IGNORED_SUFFIXES = [
  '.d.ts',
  '.test.ts',
  '.test.tsx',
  '.spec.ts',
  '.spec.tsx',
]

if (hasFlag('--help')) {
  printHelp('IITNews Unused File Checker', [
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

const projectRoot = PROJECT_ROOT

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
  getOption('report', 'reports/unused-files.md'),
)

function relative(filePath) {
  return path.relative(projectRoot, filePath).replace(/\\/g, '/')
}

function stripComments(source) {
  return source.replace(
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|\/\*[\s\S]*?\*\/|\/\/[^\r\n]*/g,
    (match, quoted) => quoted || '',
  )
}

function extractReferences(source) {
  const patterns = [
    /\bimport\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+[\s\S]*?\s+from\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ]

  const references = []

  for (const pattern of patterns) {
    let match

    while ((match = pattern.exec(source)) !== null) {
      references.push(match[1])
    }
  }

  return references
}

function resolveReference(reference, importer) {
  if (
    reference.startsWith('http://') ||
    reference.startsWith('https://') ||
    reference.startsWith('data:')
  ) {
    return null
  }

  let basePath

  if (reference.startsWith(aliasPrefix)) {
    basePath = path.resolve(
      aliasRoot,
      reference.slice(aliasPrefix.length),
    )
  } else if (reference.startsWith('.')) {
    basePath = path.resolve(path.dirname(importer), reference)
  } else {
    return null
  }

  const candidates = [
    basePath,
    ...SOURCE_EXTENSIONS.map((extension) => `${basePath}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) =>
      path.join(basePath, `index${extension}`),
    ),
  ]

  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile()
    } catch {
      return false
    }
  }) || null
}

function shouldIgnore(filePath) {
  const name = path.basename(filePath)

  if (IGNORED_FILE_NAMES.has(name)) return true

  return IGNORED_SUFFIXES.some((suffix) => name.endsWith(suffix))
}

function createReport(candidates, scannedCount) {
  const lines = [
    '# IITNews Unused File Candidates',
    '',
    `- Source files scanned: ${scannedCount}`,
    `- Candidate files: ${candidates.length}`,
    '',
    '> These are heuristic findings, not confirmed unused files.',
    '> Files referenced by route configuration, framework conventions,',
    '> glob patterns, or external tooling may not be detected.',
    '',
    '## Candidates',
    '',
  ]

  if (candidates.length === 0) {
    lines.push('No unused file candidates detected.')
  } else {
    candidates.forEach((file) => {
      lines.push(`- \`${file}\``)
    })
  }

  return lines.join('\n')
}

function main() {
  if (!fs.existsSync(srcRoot)) {
    throw new Error(`Source directory not found: ${srcRoot}`)
  }

  const files = listFiles(srcRoot, {
    extensions: SOURCE_EXTENSIONS,
  })

  const importedFiles = new Set()

  for (const file of files) {
    const source = stripComments(fs.readFileSync(file, 'utf8'))

    for (const reference of extractReferences(source)) {
      const resolved = resolveReference(reference, file)

      if (resolved) {
        importedFiles.add(path.resolve(resolved))
      }
    }
  }

  const candidates = files
    .filter((file) => !shouldIgnore(file))
    .filter((file) => !importedFiles.has(path.resolve(file)))
    .map(relative)
    .sort()

  const results = {
    sourceFilesScanned: files.length,
    candidateCount: candidates.length,
    candidates,
  }

  if (hasFlag('--json')) {
    console.log(JSON.stringify(results, null, 2))
  } else {
    log('info', 'IITNews Unused File Check')
    log('detail', `Source files scanned: ${files.length}`)
    log(
      candidates.length ? 'warning' : 'success',
      `Unused file candidates: ${candidates.length}`,
    )

    candidates.forEach((file) => {
      console.log(`  - ${file}`)
    })

    console.log(
      '\nReview each candidate before deleting it. ' +
      'Framework conventions and indirect references may not be detected.',
    )
  }

  if (hasFlag('--write-report')) {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true })
    fs.writeFileSync(
      reportPath,
      createReport(candidates, files.length),
      'utf8',
    )

    log('success', `Report written: ${relative(reportPath)}`)
  }

  return candidates.length
}

try {
  main()
} catch (error) {
  log('error', error.message)
  process.exitCode = 1
}
