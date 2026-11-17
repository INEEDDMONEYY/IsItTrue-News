#!/usr/bin/env node

/**
 * IITNews Admin Structure Analyzer
 *
 * Read-only analyzer for existing admin feature modules.
 *
 * Usage:
 *   node scripts/maintenance/frontend/audit-admin.js
 *   node scripts/maintenance/frontend/audit-admin.js --dry-run
 *   node scripts/maintenance/frontend/audit-admin.js --json
 *   node scripts/maintenance/frontend/audit-admin.js --write-report
 *   node scripts/maintenance/frontend/audit-admin.js --admin-root=src/features/admin
 *   node scripts/maintenance/frontend/audit-admin.js --src-root=src
 *
 * Safety:
 *   - Never modifies source files.
 *   - Does not assume every module has identical architecture.
 *   - Does not invent or modify routes.
 *   - Reports findings for manual review.
 */

import fs from 'node:fs'
import path from 'node:path'
import { PROJECT_ROOT } from '../../utils/file-system.js'

const args = process.argv.slice(2)

const hasFlag = (flag) => args.includes(flag)

const getOption = (name, fallback) => {
  const argument = args.find((item) => item.startsWith(`--${name}=`))
  return argument ? argument.slice(name.length + 3) : fallback
}

const projectRoot = PROJECT_ROOT

const srcRoot = path.resolve(
  projectRoot,
  getOption('src-root', 'src'),
)

const adminRoot = path.resolve(
  projectRoot,
  getOption('admin-root', 'src/features/admin'),
)

const dryRun = hasFlag('--dry-run')
const jsonOutput = hasFlag('--json')
const writeReport = hasFlag('--write-report')

const reportPath = path.resolve(
  projectRoot,
  getOption('report', 'reports/admin-structure-audit.md'),
)

const ignoredDirectories = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.turbo',
  '.cache',
])

const supportedExtensions = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
])

const folderCategories = {
  api: 'API',
  apis: 'API',
  components: 'Components',
  component: 'Components',
  pages: 'Pages',
  page: 'Pages',
  hooks: 'Hooks',
  services: 'Services',
  service: 'Services',
  state: 'State',
  store: 'State',
  stores: 'State',
  types: 'Types',
  type: 'Types',
  utils: 'Utilities',
  utilities: 'Utilities',
  data: 'Data',
  layouts: 'Layouts',
  layout: 'Layouts',
  contexts: 'Contexts',
  context: 'Contexts',
  providers: 'Providers',
  provider: 'Providers',
}

function relativeToProject(target) {
  return path.relative(projectRoot, target) || '.'
}

function toModuleName(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function walkDirectory(directory, results = []) {
  if (!fs.existsSync(directory)) return results

  let entries

  try {
    entries = fs.readdirSync(directory, { withFileTypes: true })
  } catch {
    return results
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue

    const fullPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) continue
      walkDirectory(fullPath, results)
      continue
    }

    if (!entry.isFile()) continue

    if (!supportedExtensions.has(path.extname(entry.name))) continue

    results.push(fullPath)
  }

  return results
}

function getCategory(filePath, moduleRoot) {
  const relative = path.relative(moduleRoot, filePath)
  const segments = relative.split(path.sep)

  if (segments.length > 1) {
    const folder = segments[0].toLowerCase()

    if (folderCategories[folder]) {
      return folderCategories[folder]
    }
  }

  const filename = path.basename(filePath).toLowerCase()

  if (filename.includes('page')) return 'Pages'
  if (filename.includes('hook')) return 'Hooks'
  if (filename.includes('service')) return 'Services'
  if (filename.includes('api')) return 'API'
  if (filename.includes('type')) return 'Types'
  if (filename.includes('util')) return 'Utilities'
  if (filename.includes('layout')) return 'Layouts'

  return 'Other'
}

function getModuleInventory(moduleRoot) {
  const files = walkDirectory(moduleRoot)

  const categories = {}
  const fileDetails = []

  for (const file of files) {
    const category = getCategory(file, moduleRoot)

    categories[category] = (categories[category] || 0) + 1

    fileDetails.push({
      path: relativeToProject(file),
      name: path.basename(file),
      category,
    })
  }

  return {
    files,
    fileDetails,
    categories,
  }
}

function findRouteReferences(modules, sourceFiles) {
  const routeFiles = sourceFiles.filter((file) => {
    const filename = path.basename(file).toLowerCase()

    return (
      filename.includes('route') ||
      filename.includes('router') ||
      filename === 'app.tsx' ||
      filename === 'app.ts'
    )
  })

  const references = {}

  for (const module of modules) {
    const folderName = module.name
    const camelCaseName = folderName.replace(/-([a-z])/g, (_, letter) =>
      letter.toUpperCase(),
    )

    references[folderName] = []

    for (const routeFile of routeFiles) {
      let content

      try {
        content = fs.readFileSync(routeFile, 'utf8')
      } catch {
        continue
      }

      const escapedNames = [folderName, camelCaseName]

      const found = escapedNames.some((name) => {
        const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return new RegExp(escaped, 'i').test(content)
      })

      if (found) {
        references[folderName].push(relativeToProject(routeFile))
      }
    }
  }

  return {
    scannedFiles: routeFiles.map(relativeToProject),
    references,
  }
}

function analyzeAdminDirectory() {
  if (!fs.existsSync(adminRoot)) {
    throw new Error(
      `Admin directory not found: ${relativeToProject(adminRoot)}`,
    )
  }

  const entries = fs.readdirSync(adminRoot, { withFileTypes: true })

  const modules = entries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !ignoredDirectories.has(entry.name))
    .map((entry) => {
      const moduleRoot = path.join(adminRoot, entry.name)
      const inventory = getModuleInventory(moduleRoot)

      const hasBackendFiles =
        (inventory.categories.API || 0) > 0 ||
        (inventory.categories.Services || 0) > 0

      const hasHooks = (inventory.categories.Hooks || 0) > 0
      const hasTypes = (inventory.categories.Types || 0) > 0
      const hasPages = (inventory.categories.Pages || 0) > 0
      const hasComponents = (inventory.categories.Components || 0) > 0

      return {
        name: entry.name,
        displayName: toModuleName(entry.name),
        path: relativeToProject(moduleRoot),
        totalFiles: inventory.files.length,
        categories: inventory.categories,
        files: inventory.fileDetails,
        indicators: {
          hasBackendFiles,
          hasHooks,
          hasTypes,
          hasPages,
          hasComponents,
        },
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const rootFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  const sourceFiles = walkDirectory(srcRoot)

  const routeAnalysis = findRouteReferences(modules, sourceFiles)

  const totals = {
    modules: modules.length,
    files: modules.reduce((sum, module) => sum + module.totalFiles, 0),
    modulesWithBackendFiles: modules.filter(
      (module) => module.indicators.hasBackendFiles,
    ).length,
    modulesWithHooks: modules.filter(
      (module) => module.indicators.hasHooks,
    ).length,
    modulesWithTypes: modules.filter(
      (module) => module.indicators.hasTypes,
    ).length,
    modulesWithPages: modules.filter(
      (module) => module.indicators.hasPages,
    ).length,
    modulesWithComponents: modules.filter(
      (module) => module.indicators.hasComponents,
    ).length,
  }

  return {
    generatedAt: new Date().toISOString(),
    adminRoot: relativeToProject(adminRoot),
    srcRoot: relativeToProject(srcRoot),
    totals,
    rootFiles,
    modules,
    routeAnalysis,
    notes: [
      'This analyzer is read-only.',
      'Modules are inspected independently; identical folder structures are not required.',
      'Backend integration indicators are based on filenames and directory locations.',
      'Route references are heuristic matches, not proof of valid route registration.',
      'Missing folders are not automatically treated as errors.',
    ],
  }
}

function renderMarkdown(report) {
  const lines = [
    '# IITNews Admin Structure Audit',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Admin directory: \`${report.adminRoot}\``,
    '',
    '## Overview',
    '',
    `- Modules discovered: ${report.totals.modules}`,
    `- Source files discovered: ${report.totals.files}`,
    `- Modules with API/service files: ${report.totals.modulesWithBackendFiles}`,
    `- Modules with hooks: ${report.totals.modulesWithHooks}`,
    `- Modules with types: ${report.totals.modulesWithTypes}`,
    `- Modules with pages: ${report.totals.modulesWithPages}`,
    `- Modules with components: ${report.totals.modulesWithComponents}`,
    '',
    '## Module inventory',
    '',
  ]

  for (const module of report.modules) {
    lines.push(
      `### ${module.displayName}`,
      '',
      `- Directory: \`${module.path}\``,
      `- Files: ${module.totalFiles}`,
      `- Backend files detected: ${module.indicators.hasBackendFiles ? 'Yes' : 'Not detected'}`,
      `- Hooks detected: ${module.indicators.hasHooks ? 'Yes' : 'Not detected'}`,
      `- Types detected: ${module.indicators.hasTypes ? 'Yes' : 'Not detected'}`,
      `- Pages detected: ${module.indicators.hasPages ? 'Yes' : 'Not detected'}`,
      `- Components detected: ${module.indicators.hasComponents ? 'Yes' : 'Not detected'}`,
      '',
      'File categories:',
    )

    const categories = Object.entries(module.categories)

    if (categories.length === 0) {
      lines.push('- No supported source files found.')
    } else {
      for (const [category, count] of categories) {
        lines.push(`- ${category}: ${count}`)
      }
    }

    lines.push('', 'Files:')

    for (const file of module.files) {
      lines.push(`- \`${file.path}\` — ${file.category}`)
    }

    lines.push('')
  }

  lines.push(
    '## Route reference scan',
    '',
    'The following files were scanned because their names suggest they contain route configuration:',
    '',
  )

  if (report.routeAnalysis.scannedFiles.length === 0) {
    lines.push('- No likely route configuration files were discovered.')
  } else {
    for (const file of report.routeAnalysis.scannedFiles) {
      lines.push(`- \`${file}\``)
    }
  }

  lines.push('', '### Module references', '')

  for (const module of report.modules) {
    const matches = report.routeAnalysis.references[module.name] || []

    lines.push(`**${module.displayName}**`)

    if (matches.length === 0) {
      lines.push('- No likely route reference detected.')
    } else {
      for (const match of matches) {
        lines.push(`- Possible reference: \`${match}\``)
      }
    }

    lines.push('')
  }

  lines.push('## Analyzer notes', '')

  for (const note of report.notes) {
    lines.push(`- ${note}`)
  }

  lines.push('')

  return lines.join('\n')
}

function printConsoleReport(report) {
  console.log('\nIITNews Admin Structure Audit')
  console.log('=============================')
  console.log(`Admin directory: ${report.adminRoot}`)
  console.log(`Modules found: ${report.totals.modules}`)
  console.log(`Files found: ${report.totals.files}`)
  console.log('')

  for (const module of report.modules) {
    console.log(`${module.displayName} (${module.totalFiles} files)`)

    const categories = Object.entries(module.categories)

    if (categories.length === 0) {
      console.log('  No supported source files found.')
    } else {
      for (const [category, count] of categories) {
        console.log(`  ${category}: ${count}`)
      }
    }

    console.log(
      `  Backend files: ${module.indicators.hasBackendFiles ? 'Detected' : 'Not detected'}`,
    )

    console.log(
      `  Hooks: ${module.indicators.hasHooks ? 'Detected' : 'Not detected'}`,
    )

    console.log(
      `  Types: ${module.indicators.hasTypes ? 'Detected' : 'Not detected'}`,
    )

    const routeMatches =
      report.routeAnalysis.references[module.name] || []

    console.log(
      `  Possible route references: ${routeMatches.length}`,
    )

    console.log('')
  }

  console.log('Important:')
  console.log('- No source files were changed.')
  console.log('- Missing architecture folders are not automatically errors.')
  console.log('- Route matches require manual verification.')
}

function main() {
  try {
    const report = analyzeAdminDirectory()

    if (jsonOutput) {
      console.log(JSON.stringify(report, null, 2))
    } else {
      printConsoleReport(report)
    }

    if (writeReport) {
      if (dryRun) {
        console.log(
          `\n[DRY RUN] Would write report to: ${relativeToProject(reportPath)}`,
        )
      } else {
        fs.mkdirSync(path.dirname(reportPath), { recursive: true })

        fs.writeFileSync(reportPath, renderMarkdown(report), {
          encoding: 'utf8',
          flag: 'w',
        })

        console.log(
          `\nReport written to: ${relativeToProject(reportPath)}`,
        )
      }
    }

    if (dryRun) {
      console.log('\nDry run complete. No files were modified.')
    }
  } catch (error) {
    console.error('\nAdmin audit failed:')
    console.error(error.message)
    process.exitCode = 1
  }
}

main()
